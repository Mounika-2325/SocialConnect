import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const avatarUrl = (user) => user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=dcece4&color=286451&bold=true`;

export default function UserCard({ user, following, onFollow }) {
  const { user: viewer } = useAuth();
  return <article className="surface user-card">
    <Link to={`/profile/${user._id}`}><img className="avatar" src={avatarUrl(user)} alt="" /></Link>
    <Link className="user-card-copy" to={`/profile/${user._id}`}><strong>{user.name}</strong><span>@{user.username}{user.bio ? ` · ${user.bio}` : ''}</span></Link>
    {viewer?._id !== user._id && onFollow && <button className={following ? 'button-secondary' : 'button-primary'} onClick={() => onFollow(user)}>{following ? 'Following' : 'Follow'}</button>}
  </article>;
}