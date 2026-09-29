import { useEffect, useState } from 'react';
import { Search as SearchIcon, UsersRound } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import UserCard from '../components/UserCard';
import Loading from '../components/Loading';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState(new Set());
  useEffect(() => {
    const value = params.get('q') || '';
    setQuery(value);
    if (!value.trim()) { setUsers([]); setLoading(false); return; }
    setLoading(true); setError('');
    api.get('/users', { params: { q: value } }).then(({ data }) => setUsers(data)).catch((requestError) => setError(errorMessage(requestError))).finally(() => setLoading(false));
  }, [params]);
  async function search(event) { event.preventDefault(); setParams(query.trim() ? { q: query.trim() } : {}); }
  async function toggleFollow(person) {
    const isFollowing = following.has(person._id);
    try {
      await api.post(`/users/${person._id}/${isFollowing ? 'unfollow' : 'follow'}`);
      setFollowing((previous) => { const next = new Set(previous); isFollowing ? next.delete(person._id) : next.add(person._id); return next; });
    } catch (requestError) { setError(errorMessage(requestError)); }
  }
  return <>
    <h1 className="page-title">Find your people</h1><p className="page-subtitle">Search by name or username and discover new voices.</p>
    <form className="search-form" onSubmit={search}><input className="text-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try a name or @username" aria-label="Search by name or username" /><button className="button-primary"><SearchIcon size={17} />Search</button></form>
    {error && <div className="error-banner">{error}</div>}
    {loading ? <Loading label="Looking for people…" /> : users.length ? <div className="user-list">{users.map((person) => <UserCard key={person._id} user={person} following={following.has(person._id)} onFollow={toggleFollow} />)}</div> : query ? <section className="surface empty-state"><UsersRound size={27} /><h3>No one found yet</h3><p>Try another name or username.</p></section> : <section className="surface empty-state"><UsersRound size={27} /><h3>Make a new connection</h3><p>Search for someone you know or explore a shared interest.</p></section>}
  </>;
}