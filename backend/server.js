require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, pool } = require('./config/database');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const { Report } = require('./models');
const reportRoutes = require('./routes/reportRoutes');
const { Farmer, Otp, Expert } = require('./models'); // ✅ Import all from models/index.js

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ROUTES
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath); // Use the same absolute path for saving
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });
const uploadsPath = path.join(__dirname, 'uploads');

const adminRoutes = require('./routes/admin');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', adminRoutes);

app.use('/uploads', express.static('uploads'));

// In-memory OTP store
const otps = {}; // email -> { otp, expires }

// Rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
});

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '1h';

const registerRoute = require('./routes/register');
const loginRoutes = require('./routes/login');
const forumRoutes = require('./routes/forum');
const expertForumRoutes = require('./routes/expertForum');
const { protect } = require('./middlewares/auth');
app.use(express.urlencoded({ extended: true }));
app.use('/api/register', registerRoute);
app.use('/api/login', loginRoutes);
app.use('/api/forum', protect, forumRoutes);
app.use('/api/v1/expertForum', expertForumRoutes);


// Existing routes...
app.get('/api/reports', async (req, res) => {
  const result = await Report.findAll({ order: [['id', 'DESC']] });
  res.json(result);
});

app.post('/api/reports/:id/action', async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const processed_date = new Date().toISOString().split('T')[0];

  await Report.update(
    { status, remarks, processed_date },
    { where: { id } }
  );
  res.json({ success: true });
});

// ✅ Mark report as read
app.post('/api/admin/reports/:id/mark-read', async (req, res) => {
  const { id } = req.params;
  try {
    await Report.update({ read: true }, { where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking report as read:', error);
    res.status(500).json({ error: 'Failed to mark report as read' });
  }
});

app.post('/api/report', upload.single('image'), async (req, res) => {
  try {
   // const { name, location, cropType, damageCause, description, percentage, land } = req.body;
    const { name, location, cropType, damageCause, description, percentage, land, panchayat, block, submitted_at } = req.body;
    const trackingId = 'TRK-' + Date.now();
    const now = new Date();
    const image = req.file;
    const imageUrl = image ? `uploads/${image.originalname}` : null;

    const getUrgency = (lossPercent) => {
      if (lossPercent >= 76) return 'Critical';
      if (lossPercent >= 51) return 'High';
      if (lossPercent >= 26) return 'Medium';
      return 'Low';
    };
    const urgency = getUrgency(parseFloat(percentage) || 0);
    const newReport = await Report.create({
      name, farmer_name:name, location, panchayat: panchayat || null, block: block || null, cropType, damageCause, description, imageUrl, trackingId, percentage :parseFloat(percentage) || 0, land: parseFloat(land) || 0,
      urgency,status: 'Pending',submitted_at: submitted_at ? new Date(submitted_at) : new Date(),createdAt: now,         // ✅ manually adding createdAt
      updatedAt: now   
    });
    res.status(201).json({ message: '✅ Report submitted', report: newReport });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create report' });
    console.log(error);
  }
});

/*
app.post('/api/report', upload.single('image'), async (req, res) => {
  try {
    const { name, location, cropType, damageCause, description, percentage, land, panchayat, block, submitted_at } = req.body;
    const trackingId = 'TRK-' + Date.now();
    const image = req.file;
    const imageUrl = image ? `uploads/${image.filename}` : null;

    const getUrgency = (lossPercent) => {
      if (lossPercent >= 76) return 'Critical';
      if (lossPercent >= 51) return 'High';
      if (lossPercent >= 26) return 'Medium';
      return 'Low';
    };
    const urgency = getUrgency(parseFloat(percentage) || 0);

    const newReport = await Report.create({
      name,
      location,
      panchayat: panchayat || null,
      block: block || null,
      cropType,
      damageCause,
      description,
      imageUrl,
      trackingId,
      percentage: parseFloat(percentage) || 0,
      land: parseFloat(land) || 0,
      urgency,
      status: 'Pending',
      submitted_at: submitted_at ? new Date(submitted_at) : new Date(),
      
    });
    res.status(201).json({ message: '✅ Report submitted', report: newReport });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report', details: error.message });
  }
});
*/
app.get('/api/report/TrackReportDetails/:trackingId', async (req, res) => {
  const { trackingId } = req.params;
  console.log('🔍 Looking up tracking ID:', trackingId);

  try {
    const report = await Report.findOne({ where: { trackingId } });

    if (!report) {
      console.log('⚠️ Report not found for:', trackingId);
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

app.get('/api/admin/reports', async (req, res) => {
  try {
    const reports = await Report.findAll({ order: [['id', 'DESC']] });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports', details: error.message });
  }
});

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await Expert.findOne({ where: { email } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 10 * 60 * 1000;
  otps[email] = { otp, expires };

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Idukki Agro Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for Password Reset',
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('OTP send error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});


const initializeDatabase = async () => {
  try {
    await Expert.sync(); // Creates table if it doesn't exist
    const admin = await Expert.findOne({ where: { email: 'admin@idukkiagro.com' } });

    if (!admin) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      await Expert.create({
        name: 'Admin',
        email: 'admin@idukkiagro.com',
        password: adminPassword,
        role: 'admin',
        is_verified: true
      });
      console.log('✅ Default admin created');
    }

    console.log('✅ Expert DB initialized');
  } catch (error) {
    console.error('❌ Expert DB init error:', error);
    process.exit(1);
  }
};

// Reset password
app.post('/api/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ message: 'All fields are required' });

  const stored = otps[email];
  if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await Expert.update({ password: hashed }, { where: { email } });
    delete otps[email];
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Expert login
app.post('/api/expert-login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`📩 Login attempt with Email: ${email}, Password: ${password}`);

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const user = await Expert.findOne({ where: { email } });
    if (!user) {
      console.log("❌ No user found for this email");
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    let passwordMatch = false;

    if (user.password.startsWith('$2b$')) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      passwordMatch = password === user.password;
      if (passwordMatch) {
        const hashed = await bcrypt.hash(password, 10);
        await user.update({ password: hashed });
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ success: false, message: 'Account not verified' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRE });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,    
        email: user.email,
        role: user.role,
        is_verified: user.is_verified
      }
    });
  } catch (err) {
    console.error('🔥 Login error:', err);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
});

// Change password
app.post('/api/change-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword) return res.status(400).json({ message: 'All fields required' });

  try {
    const user = await Expert.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let passwordMatch = user.password.startsWith('$2b$')
      ? await bcrypt.compare(oldPassword, user.password)
      : oldPassword === user.password;

    if (!passwordMatch) return res.status(401).json({ message: 'Old password incorrect' });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedNewPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Error changing password' });
  }
});

app.post('/api/reports/:id/action', async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const processed_date = new Date().toISOString().split('T')[0];

  try {
    await pool.query(
      'UPDATE crop_loss_reports SET status = $1, remarks = $2, processed_date = $3 WHERE id = $4',
      [status, remarks, processed_date, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server AFTER DB connection
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  });

  app.post('/api/admin/reports/:id/mark-read', async (req, res) => {
  const { id } = req.params;
  try {
    await Report.update({ read: true }, { where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking report as read:', error);
    res.status(500).json({ error: 'Failed to mark report as read' });
  }
});

  

app.get('/api/report/TrackReportDetails/:trackingId', async (req, res) => {
  const { trackingId } = req.params;
  console.log('🔍 Looking up tracking ID:', trackingId); // Add this

  try {
    const report = await Report.findOne({ where: { trackingId } });

    if (!report) {
      console.log('⚠️ Report not found for:', trackingId); // Add this
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('❌ Server error:', error); // Add this
    res.status(500).json({ message: 'Server error', error });
  }
});

