const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const sendEmail = require('../utils/sendEmail');

const generateAccessToken = (id) => {
    return jwt.sign({id},
        process.env.JWT_SECRET, 
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRE});    
}

const generateRefreshToken =(id) =>{
    return jwt.sign({id},
    process.env.JWT_REFRESH_SECRET,
    {expiresIn: process.env.REFRESH_TOKEN_EXPIRE})
}

// Register a new user and return tokens
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    // Send welcome email (non-blocking: failure won't break signup)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Nextwork Product Catalog!',
        html: `<h1>Welcome, ${user.name}!</h1><p>Thanks for signing up. You can now manage products in the catalog.</p>`,
      });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      accessToken,
      refreshToken,
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};



// Authenticate user and return tokens
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const MAX_ATTEMPTS = 5;
    const LOCK_TIME = 15 * 60 * 1000;

    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if the account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ message: 'Account is locked. Please try again later.' });
    }

    // Reset login attempts if the lock period has expired
    if (user.lockUntil && user.lockUntil <= Date.now()) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= MAX_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME;
      }
      await user.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};



// Invalidate refresh token on logout
const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+refreshToken');
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};


// Verify refresh token and issue a new token pair
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    if( user.refreshToken !== refreshToken){
      user.refreshToken = undefined;
      await user.save();
      return res.status(401).json({ message: 'Refresh token has been revoked' });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if a user exists with this email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user found with that email' });

    // Generate a random token and hash it for database storage
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

   try {
     // Build the reset URL and send the plain token via email
     const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
     await sendEmail({ to: user.email, subject: 'Password Reset Request', html: `<h1>Password Reset</h1><p>You requested a password reset.</p><p>Your reset token: <strong>${resetToken}</strong></p><p>Make a request to: ${resetUrl}</p><p>This token expires in 10 minutes.</p>` });
 
     res.status(200).json({ message: 'Password reset email sent' });
      } catch (error) {
      console.error('Error sending password reset email:', error);
      return res.status(500).json({ message: 'Error sending password reset email' });
    }
  } catch (error) {
    next(error);
}
};


const resetPassword = async (req, res, next) => {
  try {
    // Hash the token from the URL to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    // Set the new password and clear reset fields
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Please provide a new password' });

    const isSamePassword = await user.comparePassword(password);
    if (isSamePassword) {
      return res.status(400).json({
        message: 'New password must be different from the old password',
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Generate fresh tokens so the user is logged in immediately
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({ message: 'Password reset successful', accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};


// Change password for logged-in users
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Please provide current and new passwords',
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters',
      });
    }

    // Fetch the user with their password field
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Set new password (pre-save hook hashes it automatically)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  signup,
  login,
  logout,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  changePassword,
};