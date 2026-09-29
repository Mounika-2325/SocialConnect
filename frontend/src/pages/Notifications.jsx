import { useEffect, useState } from 'react';
import { Bell, Heart, MessageCircle, UserRoundPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import Loading from '../components/Loading';

const avatarUrl = (user) => user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Member')}&background=dcece4&color=286451&bold=true`;
const elapsed = (date) => { const hours = Math.floor((Date.now() - new Date(date).getTime()) / 3600000); return hours < 1 ? 'Just now' : hours < 24 ? `${hours}h ago` : new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); };

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/notifications').then(({ data }) => setItems(data)).catch((requestError) => setError(errorMessage(requestError))).finally(() => setLoading(false)); }, []);
  const icons = { follow: UserRoundPlus, like: Heart, comment: MessageCircle };
  return <>
    <h1 className="page-title">Notifications</h1><p className="page-subtitle">The latest from your Vibely circle.</p>
    {error && <div className="error-banner">{error}</div>}
    {loading ? <Loading label="Checking for updates…" /> : items.length ? <div className="user-list">{items.map((item) => { const Icon = icons[item.type] || Bell; return <article className="surface notification-row" key={item._id}><Link to={`/profile/${item.sender?._id}`}><img className="avatar" src={avatarUrl(item.sender)} alt="" /></Link><div className="notification-copy"><Link to={`/profile/${item.sender?._id}`}><strong>{item.sender?.name || 'Someone'}</strong></Link> {item.message}<time>{elapsed(item.createdAt)}</time></div><Icon size={18} color={item.type === 'like' ? '#dc796c' : '#548774'} /></article>; })}</div> : <section className="surface empty-state"><Bell size={27} /><h3>You’re all caught up</h3><p>Likes, comments, and new followers will show up here.</p></section>}
  </>;
}