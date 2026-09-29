import { Bell, Home, PlusSquare, Search, UserRound } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const avatarUrl = (user) => user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Member')}&background=dcece4&color=286451&bold=true`;
const navigation = [
  { to: '/', label: 'Home feed', icon: Home },
  { to: '/search', label: 'Discover people', icon: Search },
  { to: '/create-post', label: 'Create a post', icon: PlusSquare },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

export default function Sidebar() {
  const { user } = useAuth();
  return <>
    <aside className="sidebar">
      <nav className="side-nav">{navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}><Icon size={19} />{label}</NavLink>)}</nav>
      <div className="sidebar-divider" />
      <Link className="side-profile" to={`/profile/${user?._id}`}><img className="avatar" src={avatarUrl(user)} alt="" /><span className="side-profile-copy"><strong>{user?.name}</strong><span>@{user?.username}</span></span><UserRound size={16} /></Link>
    </aside>
    <nav className="mobile-bottom-nav">{navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} aria-label={label}><Icon size={21} /></NavLink>)}</nav>
  </>;
}