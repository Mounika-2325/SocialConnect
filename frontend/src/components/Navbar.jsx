import { Bell, Compass, LogOut, Search, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const avatarUrl = (user) => user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Member')}&background=dcece4&color=286451&bold=true`;

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return <header className="topbar"><div className="topbar-inner">
    <Link className="brand" to="/" aria-label="Vibely — Connect • Share • Discover" title="Vibely — Connect • Share • Discover"><span className="brand-mark"><Sparkles size={18} /></span>Vibely</Link>
    <form className="header-search" onSubmit={(event) => { event.preventDefault(); navigate(`/search?q=${encodeURIComponent(new FormData(event.currentTarget).get('q'))}`); }}>
      <Search size={17} /><input name="q" aria-label="Search people" placeholder="Search people" />
    </form>
    <div className="topbar-actions">
      <Link className="icon-button" aria-label="Explore people" title="Explore people" to="/search"><Compass size={19} /></Link>
      <Link className="icon-button" aria-label="Notifications" title="Notifications" to="/notifications"><Bell size={19} /></Link>
      <Link to={`/profile/${user?._id}`} title="Your profile"><img className="avatar" src={avatarUrl(user)} alt="Your profile" /></Link>
      <button className="icon-button" title="Sign out" aria-label="Sign out" onClick={() => { signOut(); navigate('/login'); }}><LogOut size={18} /></button>
    </div>
  </div></header>;
}