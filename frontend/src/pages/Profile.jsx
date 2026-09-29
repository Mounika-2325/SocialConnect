import { useEffect, useState } from 'react';
import { CalendarDays, Pencil, UsersRound } from 'lucide-react';
import { useParams } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import Loading from '../components/Loading';
import UserCard from '../components/UserCard';

const avatarUrl = (user) => user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Member')}&background=dcece4&color=286451&bold=true`;

export default function Profile() {
  const { id } = useParams();
  const { user: viewer, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followList, setFollowList] = useState(null);
  const [followUsers, setFollowUsers] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', profileImage: '' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ownProfile = String(viewer?._id) === id;
  useEffect(() => {
    setLoading(true); setError('');
    api.get(`/users/${id}`).then(({ data }) => { setProfile(data.user); setPosts(data.posts); setIsFollowing(data.isFollowing); setForm({ name: data.user.name, bio: data.user.bio || '', profileImage: data.user.profileImage || '' }); }).catch((requestError) => setError(errorMessage(requestError))).finally(() => setLoading(false));
  }, [id]);
  async function saveProfile(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { const { data } = await api.put('/users/profile', form); setProfile(data); updateUser({ ...viewer, ...data }); setEditing(false); }
    catch (requestError) { setError(errorMessage(requestError)); }
    finally { setBusy(false); }
  }
  async function follow() {
    setBusy(true); setError('');
    try { await api.post(`/users/${id}/${isFollowing ? 'unfollow' : 'follow'}`); setIsFollowing(!isFollowing); setProfile((current) => ({ ...current, followers: isFollowing ? current.followers.filter((item) => String(item) !== viewer._id) : [...current.followers, viewer._id] })); }
    catch (requestError) { setError(errorMessage(requestError)); }
    finally { setBusy(false); }
  }
  async function showFollowList(list) {
    if (followList === list) return setFollowList(null);
    setFollowList(list); setError('');
    try { const { data } = await api.get(`/users/${id}/${list}`); setFollowUsers(data); }
    catch (requestError) { setError(errorMessage(requestError)); }
  }
  if (loading) return <Loading label="Opening profile…" />;
  if (!profile) return <div className="error-banner">{error || 'Profile could not be found.'}</div>;
  return <>
    {error && <div className="error-banner">{error}</div>}
    <section className="surface profile-head"><img className="avatar" src={avatarUrl(profile)} alt={`${profile.name}'s profile`} /><div className="profile-info"><h1>{profile.name}</h1><div className="username">@{profile.username}</div>{profile.bio && <p className="profile-bio">{profile.bio}</p>}<div className="profile-stats"><span><strong>{posts.length}</strong> posts</span><button className="text-link" onClick={() => showFollowList('followers')}><strong>{profile.followers?.length || 0}</strong> followers</button><button className="text-link" onClick={() => showFollowList('following')}><strong>{profile.following?.length || 0}</strong> following</button></div><div className="username" style={{ marginTop: 10 }}><CalendarDays size={13} /> Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div></div>
      {ownProfile ? <button className="button-secondary" onClick={() => setEditing((value) => !value)}><Pencil size={15} />Edit profile</button> : <button className={isFollowing ? 'button-secondary' : 'button-primary'} disabled={busy} onClick={follow}><UsersRound size={15} />{isFollowing ? 'Following' : 'Follow'}</button>}
    </section>
    {followList && <section className="user-list" style={{ marginBottom: 20 }}><div className="section-row"><h2 className="page-title" style={{ fontSize: 17 }}>{followList === 'followers' ? 'Followers' : 'Following'}</h2><button className="button-secondary" onClick={() => setFollowList(null)}>Close</button></div>{followUsers.length ? followUsers.map((person) => <UserCard key={person._id} user={person} />) : <div className="surface empty-state"><p>No {followList} yet.</p></div>}</section>}
    {editing && <form className="surface edit-profile-form" onSubmit={saveProfile}><h2 className="page-title" style={{ fontSize: 17 }}>Edit profile</h2><label className="field-label">Full name<input className="text-input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength={80} required /></label><label className="field-label">Bio<textarea className="text-area" style={{ minHeight: 86 }} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} maxLength={180} /></label><label className="field-label">Profile image URL<input className="text-input" type="url" placeholder="https://example.com/avatar.jpg" value={form.profileImage} onChange={(event) => setForm({ ...form, profileImage: event.target.value })} /></label><button className="button-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button></form>}
    <div className="section-row"><h2 className="page-title" style={{ fontSize: 19 }}>Posts</h2></div>
    {posts.length ? <div className="feed-list">{posts.map((post) => <PostCard key={post._id} post={post} onDelete={(postId) => setPosts((previous) => previous.filter((item) => item._id !== postId))} />)}</div> : <section className="surface empty-state"><UsersRound size={26} /><h3>No posts here yet</h3><p>When this person shares something, it will appear here.</p></section>}
  </>;
}