const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ForumQuestion, ForumReply, Farmer, Expert, ReplyVote } = require('../models');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/forum');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup for audio uploads
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `question-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @route   POST /api/forum/submit
// @desc    Submit a new question with optional audio
// @access  Private (Farmer only)
router.post('/submit', protect, upload.single('audio'), async (req, res) => {
  try {
    // Verify farmer access
    if (req.userType !== 'farmer') {
      // Clean up uploaded file if any
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: 'Only farmers can submit questions'
      });
    }

    const { question_text, region, is_emergency } = req.body;
    
    // Validate required fields
    if (!region || (!question_text && !req.file)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Region is required and either question text or audio must be provided'
      });
    }

    const audio_path = req.file ? path.relative(path.join(__dirname, '../'), req.file.path).replace(/\\/g, '/') : null;

    const newQuestion = await ForumQuestion.create({
      farmer_id: req.user.id,
      question_text: question_text || null,
      audio_path,
      region,
      is_emergency: is_emergency === 'true' || is_emergency === true,
    });

    // Include farmer details in response
    const farmer = await Farmer.findByPk(req.user.id, {
      attributes: ['id', 'name', 'village']
    });

    res.status(201).json({ 
      success: true,
      data: {
        ...newQuestion.toJSON(),
        Farmer: farmer
      }
    });
  } catch (error) {
    console.error('Error submitting question:', error);
    
    // Delete uploaded file if question creation failed
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error cleaning up audio file:', err);
      }
    }

    const statusCode = error.name === 'SequelizeValidationError' ? 400 : 500;
    res.status(statusCode).json({ 
      success: false,
      message: error.name === 'SequelizeValidationError' 
        ? 'Validation error: ' + error.errors.map(e => e.message).join(', ')
        : 'Failed to submit question',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/forum/reply
// @desc    Submit a reply to a question
// @access  Private (Both farmers and experts)
router.post('/reply', protect, async (req, res) => {
  try {
    const { question_id, reply_text } = req.body;
    
    // Validate input
    if (!question_id || !reply_text) {
      return res.status(400).json({
        success: false,
        message: 'Question ID and reply text are required'
      });
    }

    // Check if question exists
    const question = await ForumQuestion.findByPk(question_id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Create reply
    const replyData = {
      question_id,
      reply_text,
    };

    // Set the appropriate user type
    if (req.userType === 'expert') {
      replyData.expert_id = req.user.id;
      // Get expert name if not provided
      const expert = await Expert.findByPk(req.user.id);
      replyData.expert_name = expert?.name || 'Expert';
    } else if (req.userType === 'farmer') {
      replyData.farmer_id = req.user.id;
      // Get farmer name if not provided
      const farmer = await Farmer.findByPk(req.user.id);
      replyData.farmer_name = farmer?.name || 'Farmer';
    }

    const newReply = await ForumReply.create(replyData);

    // Include user details in response
    if (req.userType === 'expert') {
      const expert = await Expert.findByPk(req.user.id, {
        attributes: ['id', 'name', 'is_verified']
      });
      newReply.dataValues.Expert = expert;
    } else if (req.userType === 'farmer') {
      const farmer = await Farmer.findByPk(req.user.id, {
        attributes: ['id', 'name', 'village']
      });
      newReply.dataValues.Farmer = farmer;
    }

    res.status(201).json({
      success: true,
      data: newReply
    });
  } catch (error) {
    console.error('Error submitting reply:', error);
    const statusCode = error.name === 'SequelizeValidationError' ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.name === 'SequelizeValidationError' 
        ? 'Validation error: ' + error.errors.map(e => e.message).join(', ')
        : 'Failed to submit reply',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/forum/my-questions
// @desc    Get questions with replies (all questions for farmers, filtered when requested)
// @access  Private
router.get('/my-questions', protect, async (req, res) => {
  try {
    const { my_questions_only, include_replies } = req.query;
    
    const queryOptions = {
      order: [
        ['is_emergency', 'DESC'],
        ['created_at', 'DESC']
      ],
      include: [
        {
          model: Farmer,
          as: 'Farmer',
          attributes: ['id', 'name', 'village', 'panchayat', 'block']
        }
      ]
    };

    // Include replies if requested
    if (include_replies === 'true') {
      queryOptions.include.push({
        model: ForumReply,
        as: 'ForumReplies',
        include: [
          {
            model: Expert,
            as: 'Expert',
            attributes: ['id', 'name', 'is_verified']
          },
          {
            model: Farmer,
            as: 'Farmer',
            attributes: ['id', 'name', 'village']
          }
        ],
        order: [['created_at', 'ASC']] // Oldest replies first
      });
    }

    // Only filter by farmer_id if specifically requested
    if (my_questions_only === 'true' && req.userType === 'farmer') {
      queryOptions.where = { farmer_id: req.user.id };
    }

    const questions = await ForumQuestion.findAll(queryOptions);

    res.status(200).json({ 
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/forum/question/:id
// @desc    Get a single question with replies
// @access  Private
router.get('/question/:id', protect, async (req, res) => {
  try {
    const question = await ForumQuestion.findByPk(req.params.id, {
      include: [
        {
          model: Farmer,
          as: 'Farmer',
          attributes: ['id', 'name', 'village']
        },
        {
          model: ForumReply,
          as: 'ForumReplies',
          include: [
            {
              model: Expert,
              as: 'Expert',
              attributes: ['id', 'name', 'is_verified']
            },
            {
              model: Farmer,
              as: 'Farmer',
              attributes: ['id', 'name', 'village']
            }
          ],
          order: [['created_at', 'ASC']]
        }
      ]
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching question',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/forum/question/:id
// @desc    Delete a question
// @access  Private
router.delete('/question/:id', protect, async (req, res) => {
  try {
    const whereCondition = { id: req.params.id };
    
    // Farmers can only delete their own questions
    if (req.userType === 'farmer') {
      whereCondition.farmer_id = req.user.id;
    }

    const question = await ForumQuestion.findOne({ where: whereCondition });

    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found or unauthorized' 
      });
    }

    // Delete associated audio file if exists
    if (question.audio_path) {
      const fullPath = path.join(__dirname, '../', question.audio_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await question.destroy();
    
    res.status(200).json({ 
      success: true,
      data: null,
      message: 'Question deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete question',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});


// ✅ Step 3: Add voting endpoint to forum route (routes/forum.js)
router.post('/reply/:id/vote', protect, async (req, res) => {
  try {
    if (req.userType !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Only farmers can vote.' });
    }

    const replyId = req.params.id;
    const reply = await ForumReply.findByPk(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found.' });
    }

    // if (reply.farmer_id === req.user.id) {
    //   return res.status(400).json({ success: false, message: "You can't vote your own reply." });
    // }


      // const isOwner = 
      // (reply.farmer_id && reply.farmer_id === req.user.id) || 
      // (reply.expert_id && reply.expert_id === req.user.id);
      

         // New ownership check that considers user type
if (req.userType === 'farmer' && reply.farmer_id && parseInt(reply.farmer_id) === parseInt(req.user.id)) {
  return res.status(400).json({ 
    success: false, 
    message: "You can't vote for your own reply" 
  });
}

if (req.userType === 'expert' && reply.expert_id && parseInt(reply.expert_id) === parseInt(req.user.id)) {
  return res.status(400).json({ 
    success: false, 
    message: "You can't vote for your own reply" 
  });
}
       




    // const existingVote = await models.ReplyVote.findOne({
    const existingVote = await ReplyVote.findOne({

      where: { farmer_id: req.user.id, reply_id: replyId }
    });

    if (existingVote) {
      return res.status(400).json({ success: false, message: 'You already voted on this reply.' });
    }

    await ReplyVote.create({ farmer_id: req.user.id, reply_id: replyId });
    // reply.upvotes = (reply.upvotes || 0) + 1;  // Change this line

    // await reply.save();


     await reply.increment('upvotes', { by: 1 });
     const updatedReply = await reply.reload();


    res.status(200).json({ success: true, message: 'Vote counted.', upvotes: updatedReply.upvotes  // Return the actual upvotes count
 });
  } catch (error) {
    console.error('Voting error:', error);
    res.status(500).json({ success: false, message: 'Failed to vote.' });
  }
});



module.exports = router;