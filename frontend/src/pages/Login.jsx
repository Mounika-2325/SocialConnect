import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      signIn(data.token, data.user); navigate(location.state?.from || '/', { replace: true });
    } catch (requestError) {
      if (requestError.response?.status === 403 && requestError.response.data.userId) navigate('/verify-otp', { state: { userId: requestError.response.data.userId } });
      else setError(errorMessage(requestError, 'Could not sign in.'));
    } finally { setBusy(false); }
  }
  return <section className="surface auth-page">
    <Link className="brand auth-brand" to="/"><span className="brand-mark"><Sparkles size={18} /></span>Vibely</Link>
    <h1>Good to see you.</h1><p>Sign in to catch up with your people and the moments they shared.</p>
    {error && <div className="error-banner">{error}</div>}
    <form className="form-stack" onSubmit={submit}>
      <label className="field-label">Email or username<input className="text-input" autoComplete="username" value={form.identifier} onChange={(event) => setForm({ ...form, identifier: event.target.value })} required /></label>
      <label className="field-label">Password<span className="password-field"><input className="text-input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /><button className="password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button></span></label>
      <button className="button-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
    <div className="auth-switch">New to Vibely? <Link to="/register">Create an account</Link></div>
  </section>;
}