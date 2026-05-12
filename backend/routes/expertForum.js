const express = require('express');
const { ForumQuestion, Farmer, ForumReply, Expert } = require('../models');
const { protect, isExpert } = require('../middlewares/auth');

const router = express.Router();

// Get all questions with replies
router.get('/questions', protect, isExpert, async (req, res) => {
  console.log('Questions endpoint reached'); // Verify route is hit

  try {
    console.log('Authenticated user:', req.user.id); // Verify auth

    const questions = await ForumQuestion.findAll({
      include: [
        {
          model: Farmer,
          as: 'Farmer', // ✅ Must match alias used in association
          attributes: ['name', 'village', 'panchayat', 'block']
        },
        {
          model: ForumReply,
          as: 'ForumReplies', // ✅ Must match alias if you used it in association
          include: [{
            model: Expert,
            as: 'Expert', // ✅ Must match alias used in association
            // attributes: ['name', 'is_verified'],

                       attributes: ['id', 'name', 'is_verified'], // ✅ Make sure ID is included

               
            required: false
          },
          {
              model: Farmer,
              as: 'Farmer',
              attributes: ['name'],
              required: false
            

          }]
        }
      ],
      order: [
        ['is_emergency', 'DESC'],
        ['created_at', 'DESC']
      ]
    });

    // Format response with fallbacks for frontend compatibility
    const formattedQuestions = questions.map(question => ({
      ...question.toJSON(),
      ForumReplies: question.ForumReplies?.map(reply => ({
        ...reply.toJSON(),
       
            upvotes: reply.upvotes || 0, // Add this line to include upvotes


        expert_name: reply.Expert?.name || reply.expert_name || 'Unknown Expert',
        is_verified: reply.Expert?.is_verified || false,
        question_id: reply.question_id,
        reply_text: reply.reply_text,
        created_at: reply.created_at
      }))
    }));

    res.json({
      success: true,
      questions: formattedQuestions
    });
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching questions',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Submit a reply
router.post('/reply', protect, isExpert, async (req, res) => {
  try {
    const { question_id, reply_text } = req.body;

    if (!question_id || !reply_text) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const reply = await ForumReply.create({
      question_id,
      expert_id: req.user.id,
      expert_name: req.user.name,
      reply_text
    });

    const replyWithDetails = await ForumReply.findByPk(reply.id, {
      include: [{
        model: Expert,
        as: 'Expert', // ✅ Include alias here too
        attributes: ['name', 'is_verified']
         },
        { 
          model: Farmer, 
          as: 'Farmer',
          attributes: ['id', 'name'] 
      }]
    });

    res.status(201).json({
      success: true,
      reply: {
        ...replyWithDetails.toJSON(),
        expert_name: replyWithDetails.Expert?.name || req.user.name,
        is_verified: replyWithDetails.Expert?.is_verified || false
      }
    });
  } catch (err) {
    console.error('Error submitting reply:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to submit reply',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
