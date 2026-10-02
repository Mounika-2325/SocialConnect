import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';

const authorFields = 'name username profileImage';
const populatePost = (query) => query.populate('author', authorFields).populate('likes', 'name username profileImage');

export async function listPosts(req, res) {
  const posts = await populatePost(Post.find().sort({ createdAt: -1 }).limit(50));
  const counts = await Comment.aggregate([{ $match: { post: { $in: posts.map((post) => post._id) } } }, { $group: { _id: '$post', count: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((entry) => [String(entry._id), entry.count]));
  res.json(posts.map((post) => ({ ...post.toObject(), commentCount: countMap.get(String(post._id)) || 0 })));
}

export async function createPost(req, res) {
  const { text, image = '' } = req.body;
  if (typeof text !== 'string' || !text.trim() || text.length > 2000) return res.status(400).json({ message: 'Write a post between 1 and 2,000 characters.' });
  if (image && !/^https?:\/\//i.test(image)) return res.status(400).json({ message: 'Image URL must start with http:// or https://.' });
  const created = await Post.create({ author: req.user._id, text: text.trim(), image });
  const post = await populatePost(Post.findById(created._id));
  res.status(201).json({ ...post.toObject(), commentCount: 0 });
}

export async function deletePost(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Post not found.' });
  }
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found.' });
  if (String(post.author) !== String(req.user._id)) return res.status(403).json({ message: 'Only the post owner can delete this post.' });
  await Promise.all([post.deleteOne(), Comment.deleteMany({ post: post._id }), Notification.deleteMany({ post: post._id })]);
  res.json({ message: 'Post deleted.' });
}

export async function toggleLike(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Post not found.' });
  }
  const post = await Post.findById(req.params.id).select('author likes');
  if (!post) return res.status(404).json({ message: 'Post not found.' });
  const liked = !post.likes.some((id) => String(id) === String(req.user._id));
  if (liked) {
    await Post.updateOne({ _id: post._id }, { $addToSet: { likes: req.user._id } });
    if (String(post.author) !== String(req.user._id)) await Notification.create({ recipient: post.author, sender: req.user._id, type: 'like', post: post._id, message: 'liked your post' });
  } else await Post.updateOne({ _id: post._id }, { $pull: { likes: req.user._id } });
  const updated = await Post.findById(post._id).select('likes');
  res.json({ liked, likes: updated.likes });
}

export async function listComments(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Post not found.' });
  }
  if (!await Post.exists({ _id: req.params.id })) return res.status(404).json({ message: 'Post not found.' });
  const comments = await Comment.find({ post: req.params.id }).sort({ createdAt: 1 }).populate('author', authorFields);
  res.json(comments);
}

export async function createComment(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Post not found.' });
  }
  const text = req.body.text;
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found.' });
  if (typeof text !== 'string' || !text.trim() || text.length > 1000) return res.status(400).json({ message: 'Write a comment between 1 and 1,000 characters.' });
  const comment = await Comment.create({ post: post._id, author: req.user._id, text: text.trim() });
  if (String(post.author) !== String(req.user._id)) await Notification.create({ recipient: post.author, sender: req.user._id, type: 'comment', post: post._id, message: 'commented on your post' });
  await comment.populate('author', authorFields);
  res.status(201).json(comment);
}

export async function deleteComment(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Comment not found.' });
  }
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: 'Comment not found.' });
  if (String(comment.author) !== String(req.user._id)) return res.status(403).json({ message: 'You can only delete your own comments.' });
  await comment.deleteOne();
  res.json({ message: 'Comment deleted.' });
}