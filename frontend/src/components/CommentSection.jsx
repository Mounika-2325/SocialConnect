import { useEffect, useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const avatarUrl = (user) => user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Member')}&background=dcece4&color=286451&bold=true`;

export default function CommentSection({ postId, onCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get(`/posts/${postId}/comments`).then(({ data }) => setComments(data)).catch(() => setError('Comments could not be loaded.')); }, [postId]);
  async function submit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    setBusy(true); setError('');
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { text });
      setComments((previous) => [...previous, data]); setText(''); onCountChange?.(1);
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setBusy(false); }
  }
  async function remove(comment) {
    try { await api.delete(`/comments/${comment._id}`); setComments((previous) => previous.filter((item) => item._id !== comment._id)); onCountChange?.(-1); }
    catch (requestError) { setError(errorMessage(requestError)); }
  }
  return <div className="comment-section">
    {error && <p className="error-banner">{error}</p>}
    <div className="comment-list">{comments.map((comment) => <div className="comment-row" key={comment._id}>
      <img className="avatar" src={avatarUrl(comment.author)} alt="" />
      <div className="comment-bubble"><strong>{comment.author?.name || 'Member'}</strong><span>{comment.text}</span></div>
      {comment.author?._id === user?._id && <button className="icon-button" title="Delete comment" aria-label="Delete comment" onClick={() => remove(comment)}><Trash2 size={15} /></button>}
    </div>)}</div>
    <form className="comment-form" onSubmit={submit}><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a comment…" maxLength={1000} aria-label="Write a comment" /><button className="icon-button" disabled={busy || !text.trim()} aria-label="Send comment"><Send size={17} /></button></form>
  </div>;
}