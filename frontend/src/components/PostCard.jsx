import { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from './CommentSection';

const avatarUrl = (user) => user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Member')}&background=dcece4&color=286451&bold=true`;
const timeAgo = (date) => {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function PostCard({ post: initialPost, onDelete, sample = false }) {
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const liked = post.likes?.some((liker) => String(liker?._id || liker) === String(user?._id));
  async function toggleLike() {
    if (sample) return setError('Sign in to interact with community posts.');
    setBusy(true); setError('');
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      setPost((previous) => ({ ...previous, likes: data.likes }));
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setBusy(false); }
  }
  async function removePost() {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try { await api.delete(`/posts/${post._id}`); onDelete?.(post._id); }
    catch (requestError) { setError(errorMessage(requestError)); }
  }
  return <article className="surface post-card">
    <header className="post-header"><Link to={`/profile/${post.author?._id || ''}`}><img className="avatar" src={avatarUrl(post.author)} alt="" /></Link>
      <div className="post-user"><Link to={`/profile/${post.author?._id || ''}`}><strong>{post.author?.name || 'Community member'}</strong></Link><span>@{post.author?.username || 'vibely'} · {timeAgo(post.createdAt)}</span></div>
      {post.author?._id === user?._id && !sample && <button className="icon-button" aria-label="Delete post" title="Delete post" onClick={removePost}><Trash2 size={17} /></button>}
      {sample && <MoreHorizontal size={19} color="#9aa8a1" />}
    </header>
    <div className="post-copy">{post.text}</div>
    {post.image && <img className="post-image" src={post.image} alt="Shared by the author" loading="lazy" />}
    <div className="post-meta"><span>{post.likes?.length || 0} {post.likes?.length === 1 ? 'like' : 'likes'}</span><span>{post.commentCount || 0} comments</span></div>
    <div className="post-actions"><button className={`post-action${liked ? ' liked' : ''}`} disabled={busy} onClick={toggleLike}><Heart size={18} fill={liked ? 'currentColor' : 'none'} />Like</button><button className="post-action" onClick={() => setCommentsOpen((open) => !open)}><MessageCircle size={18} />Comment</button></div>
    {error && <p className="error-banner" style={{ margin: '0 14px 12px' }}>{error}</p>}
    {commentsOpen && !sample && <CommentSection postId={post._id} onCountChange={(change) => setPost((previous) => ({ ...previous, commentCount: Math.max(0, (previous.commentCount || 0) + change) }))} />}
    {commentsOpen && sample && <div className="comment-section"><p className="page-subtitle" style={{ margin: '12px 0 0' }}>Join the conversation after connecting your account.</p></div>}
  </article>;
}