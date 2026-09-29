import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { listPosts, createPost, deletePost, toggleLike, listComments, createComment } from '../controllers/postController.js';

const router = Router();
router.get('/', asyncHandler(listPosts));
router.post('/', asyncHandler(requireAuth), asyncHandler(createPost));
router.delete('/:id', asyncHandler(requireAuth), asyncHandler(deletePost));
router.post('/:id/like', asyncHandler(requireAuth), asyncHandler(toggleLike));
router.get('/:id/comments', asyncHandler(listComments));
router.post('/:id/comments', asyncHandler(requireAuth), asyncHandler(createComment));

export default router;