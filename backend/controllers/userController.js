import User from '../models/User.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';

const fields = 'name username profileImage bio followers following isVerified createdAt';

export async function searchUsers(req, res) {
  const query = String(req.query.q || '').trim().slice(0, 50);
  if (!query) return res.json([]);
  const literal = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const users = await User.find({ isVerified: true, $or: [{ name: { $regex: literal, $options: 'i' } }, { username: { $regex: literal, $options: 'i' } }] }).select(fields).limit(20);
  res.json(users);
}

export async function getUser(req, res) {
  const user = await User.findById(req.params.id).select(fields);
  if (!user || !user.isVerified) return res.status(404).json({ message: 'Profile not found.' });
  const [posts, isFollowing] = await Promise.all([
    Post.find({ author: user._id }).sort({ createdAt: -1 }).populate('author', 'name username profileImage').populate('likes', 'name username profileImage'),
    req.user ? User.exists({ _id: req.user._id, following: user._id }) : false,
  ]);
  res.json({ user, posts, isFollowing: Boolean(isFollowing), isOwnProfile: String(req.user?._id) === String(user._id) });
}

export async function updateProfile(req, res) {
  const { name, bio, profileImage } = req.body;
  if (typeof name !== 'string' || !name.trim() || name.length > 80) return res.status(400).json({ message: 'Name is required and must be 80 characters or fewer.' });
  if (bio !== undefined && (typeof bio !== 'string' || bio.length > 180)) return res.status(400).json({ message: 'Bio must be 180 characters or fewer.' });
  if (profileImage && !/^https?:\/\//i.test(profileImage)) return res.status(400).json({ message: 'Profile image URL must start with http:// or https://.' });
  const user = await User.findByIdAndUpdate(req.user._id, { name: name.trim(), bio: bio ?? '', profileImage: profileImage ?? '' }, { new: true }).select(fields);
  res.json(user);
}

async function changeFollow(req, res, shouldFollow) {
  if (String(req.user._id) === req.params.id) return res.status(400).json({ message: 'You cannot follow yourself.' });
  const target = await User.findById(req.params.id);
  if (!target || !target.isVerified) return res.status(404).json({ message: 'User not found.' });
  if (shouldFollow) {
    await Promise.all([User.updateOne({ _id: req.user._id }, { $addToSet: { following: target._id } }), User.updateOne({ _id: target._id }, { $addToSet: { followers: req.user._id } })]);
    await Notification.findOneAndUpdate({ recipient: target._id, sender: req.user._id, type: 'follow' }, { message: 'started following you', read: false }, { upsert: true });
  } else {
    await Promise.all([User.updateOne({ _id: req.user._id }, { $pull: { following: target._id } }), User.updateOne({ _id: target._id }, { $pull: { followers: req.user._id } }), Notification.deleteOne({ recipient: target._id, sender: req.user._id, type: 'follow' })]);
  }
  res.json({ following: shouldFollow });
}

export const followUser = (req, res) => changeFollow(req, res, true);
export const unfollowUser = (req, res) => changeFollow(req, res, false);

export async function getFollowList(req, res) {
  const field = req.params.list === 'followers' ? 'followers' : 'following';
  const user = await User.findById(req.params.id).select(field).populate(field, fields);
  if (!user) return res.status(404).json({ message: 'Profile not found.' });
  res.json(user[field]);
}