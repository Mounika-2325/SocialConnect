import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { register, sendOtp, verifyOtp, login } from '../controllers/authController.js';

const router = Router();
router.post('/register', asyncHandler(register));
router.post('/send-otp', asyncHandler(sendOtp));
router.post('/verify-otp', asyncHandler(verifyOtp));
router.post('/login', asyncHandler(login));

export default router;