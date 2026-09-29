import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { searchUsers, getUser, updateProfile, followUser, unfollowUser, getFollowList } from '../controllers/userController.js';
import User from '../models/User.js';

const router = Router();
async function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  try {
    const jwt = await import('jsonwebtoken');
    const payload = jwt.default.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.userId);
  } catch {
    req.user = null;
  }
  next();
}

router.get('/', asyncHandler(searchUsers));
router.put('/profile', asyncHandler(requireAuth), asyncHandler(updateProfile));
router.get('/:id/:list(followers|following)', asyncHandler(getFollowList));
router.post('/:id/follow', asyncHandler(requireAuth), asyncHandler(followUser));
router.post('/:id/unfollow', asyncHandler(requireAuth), asyncHandler(unfollowUser));
router.get('/:id', asyncHandler(optionalAuth), asyncHandler(getUser));

export default router;