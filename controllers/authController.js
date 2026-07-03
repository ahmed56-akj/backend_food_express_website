const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Helper function to generate 6-digit OTP / Temporary Password
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Setup Nodemailer Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 1. SIGNUP & SEND OTP
const signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const generatedOtp = generateOTP();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ 
      name, 
      email, 
      phone, 
      password: hashedPassword, 
      otp: generatedOtp, 
      isVerified: false 
    });
    
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🍕 FoodExpress Verification Code',
      text: `Your 6-digit OTP registration code is: ${generatedOtp}`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ msg: 'OTP sent to your email account' });

  } catch (err) {
    res.status(500).json({ msg: 'Server Error in Signup: ' + err.message });
  }
};

// 2. VERIFY OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: 'User not found' });
    
    if (!user.otp || user.otp !== otp.toString().trim()) {
      return res.status(400).json({ msg: 'Invalid or expired verification OTP code' });
    }

    user.isVerified = true;
    user.otp = undefined; 
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token, msg: 'Account verified successfully', user: { name: user.name, email: user.email } });

  } catch (err) {
    res.status(500).json({ msg: 'Server Error in Verification: ' + err.message });
  }
};

// 3. LOGIN & SEND OTP EVERY TIME
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Aap registered nahi hain! Pehle Signup karein.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Galat password! Dubara koshish karein.' });
    }

    const newOtp = generateOTP();
    user.otp = newOtp;
    user.isVerified = false; 
    
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'FoodExpress - Login Verification OTP',
      text: `Hello ${user.name},\n\nYour login verification code is: ${newOtp}\n\nUse this code to complete your login.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      msg: 'Login OTP sent to your email account', 
      redirectToOtp: true,
      email: user.email 
    });

  } catch (err) {
    res.status(500).json({ msg: 'Server Error in Login: ' + err.message });
  }
};

// 4. FORGOT PASSWORD (Naya password email par bhejna)
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Database mein user dhoondein
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "Aapka email registered nahi hai!" });
        }

        // Ek naya temporary password/code generate karein
        const tempPassword = generateOTP(); 

        // Is naye temporary password ko encrypt (hash) karein database ke liye
        const salt = await bcrypt.genSalt(10);
        const hashedTempPassword = await bcrypt.hash(tempPassword, salt);

        // User ka purana password naye password se badal dein
        user.password = hashedTempPassword;
        await user.save();

        // Email setup: user ko naya temporary password bhejein
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: '🔒 FoodExpress - Your New Temporary Password',
            text: `Hello ${user.name},\n\nAapne password forgot karne ki request ki thi. Aapka naya temporary password yeh hai:\n\n👉 ${tempPassword}\n\nIs password ko use karke aap login kar sakte hain aur baad mein setting mein jaakar isko change kar sakte hain.`
        };

        // Mail send karein
        await transporter.sendMail(mailOptions);

        res.status(200).json({ 
            success: true, 
            message: `A new temporary password has been sent to ${email}` 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};

module.exports = {
    signup,
    verifyOtp,
    login,
    forgotPassword
};