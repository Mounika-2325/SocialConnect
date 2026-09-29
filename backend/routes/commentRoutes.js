import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { deleteComment } from '../controllers/postController.js';

const router = Router();
router.delete('/:id', asyncHandler(requireAuth), asyncHandler(deleteComment));

export default router;