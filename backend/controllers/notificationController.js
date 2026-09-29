import Notification from '../models/Notification.js';

export async function listNotifications(req, res) {
  const items = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50).populate('sender', 'name username profileImage').populate('post', 'text image');
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  res.json(items);
}