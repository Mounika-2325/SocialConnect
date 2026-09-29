import { useEffect, useState } from 'react';
import { Plus, Rss } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import PostCard from '../components/PostCard';

const samplePosts = [
  { _id: 'sample-1', author: { _id: 'sample-maya', name: 'Maya Chen', username: 'mayainmotion', profileImage: 'https://i.pravatar.cc/120?img=47' }, text: 'A little reminder to take the scenic route when you can. Found this quiet corner on my morning walk and it completely changed the pace of my day. 🌿', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1100&q=80', likes: [{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }], commentCount: 8, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: 'sample-2', author: { _id: 'sample-jules', name: 'Julian Rivera', username: 'julianmakes', profileImage: 'https://i.pravatar.cc/120?img=12' }, text: 'Sunday table, full of good things and even better company. What are you making this weekend?', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1100&q=80', likes: [{ _id: 'a' }, { _id: 'b' }], commentCount: 3, createdAt: new Date(Date.now() - 7200000).toISOString() },
];

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/posts').then(({ data }) => setPosts(data)).catch((requestError) => { setError(errorMessage(requestError)); setPosts(samplePosts); }).finally(() => setLoading(false));
  }, []);
  return <>
    <h1 className="page-title">Your community</h1><p className="page-subtitle">A little inspiration from the people you follow.</p>
    {error && <div className="error-banner">{error} Showing sample posts for now.</div>}
    <div className="surface composer-card"><img className="avatar" src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=dcece4&color=286451&bold=true`} alt="" /><Link className="composer-prompt" to="/create-post">What’s happening in your world?</Link><Link className="button-primary" to="/create-post"><Plus size={17} />Post</Link></div>
    {loading ? <Loading label="Gathering the latest posts…" /> : posts.length ? <div className="feed-list">{posts.map((post) => <PostCard key={post._id} post={post} sample={String(post._id).startsWith('sample-')} onDelete={(id) => setPosts((previous) => previous.filter((item) => item._id !== id))} />)}</div> : <section className="surface empty-state"><Rss size={27} /><h3>Your feed is ready for a first hello.</h3><p>Follow people or share something of your own to get started.</p><Link className="button-primary" style={{ marginTop: 17 }} to="/create-post">Write your first post</Link></section>}
  </>;
}