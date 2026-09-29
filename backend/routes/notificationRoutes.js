import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { listNotifications } from '../controllers/notificationController.js';

const router = Router();
router.get('/', asyncHandler(requireAuth), asyncHandler(listNotifications));

export default router;