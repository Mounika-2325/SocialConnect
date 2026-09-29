import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import mongoose from 'mongoose';
import User from '../models/User.js';

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  phone: user.phone,
  profileImage: user.profileImage,
  bio: user.bio,
  followers: user.followers,
  following: user.following,
  isVerified: user.isVerified,
});

export async function register(req, res) {
  try {
    const { name, username, email, phone, password, confirmPassword } = req.body;
    if (![name, username, email, phone, password].every((value) => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ message: 'Please complete every required field.' });
    }
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) return res.status(400).json({ message: 'Username must be 3–24 letters, numbers, or underscores.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (!/^\+[1-9]\d{7,14}$/.test(phone.trim())) return res.status(400).json({ message: 'Use a valid mobile number with country code, such as +15551234567.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    if (confirmPassword !== undefined && password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match.' });
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'MongoDB is unavailable. Start MongoDB or check MONGODB_URI, then try again.' });
    }
    const duplicate = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }, { phone }] });
    if (duplicate) return res.status(409).json({ message: 'That email, username, or phone number is already registered.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), username: username.toLowerCase(), email: email.toLowerCase(), phone: phone.trim(), password: passwordHash });
    res.status(201).json({ message: 'Account created. Verify your phone number to activate it.', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Unable to create your account.', detail: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}

export async function sendOtp(req, res) {
  try {
    const { userId, phone } = req.body;
    const user = userId ? await User.findById(userId) : await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'Account not found. Please register first.' });
    if (user.isVerified) return res.status(409).json({ message: 'This account is already verified.' });
    const otp = String(crypto.randomInt(100000, 1000000));
    user.otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    const configured = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER;
    if (configured) {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({ body: `Your Vibely verification code is ${otp}. It expires in 10 minutes.`, from: process.env.TWILIO_PHONE_NUMBER, to: user.phone });
      return res.json({ message: `A verification code was sent to ${user.phone}.`, userId: user._id });
    }
    if (process.env.NODE_ENV !== 'production') return res.json({ message: 'Twilio is not configured. Use this local development code.', userId: user._id, developmentOtp: otp });
    return res.status(503).json({ message: 'Phone verification is temporarily unavailable. Please try again later.' });
  } catch (error) {
    res.status(502).json({ message: 'Could not send the verification code.', detail: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId).select('+otpHash +otpExpiresAt');
    if (!user) return res.status(404).json({ message: 'Account not found.' });
    const hash = crypto.createHash('sha256').update(String(otp || '')).digest('hex');
    if (!user.otpHash || !user.otpExpiresAt || user.otpExpiresAt < new Date() || hash !== user.otpHash) {
      return res.status(400).json({ message: 'That code is incorrect or expired. Request a new one.' });
    }
    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
    res.json({ message: 'Phone verified. Your account is ready.', user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Unable to verify your code.' });
  }
}

export async function login(req, res) {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: 'Enter your email or username and password.' });
    const user = await User.findOne({ $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }] }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'The username/email or password is incorrect.' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your phone number before signing in.', userId: user._id });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Unable to sign in.' });
  }
}