import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import api, { errorMessage } from '../services/api';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(location.state?.userId || sessionStorage.getItem('socialconnect-pending-user') || '');
  const [otp, setOtp] = useState(location.state?.developmentOtp || '');
  const [message, setMessage] = useState(location.state?.message || 'Enter the six-digit code sent to your mobile number.');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (userId) sessionStorage.setItem('socialconnect-pending-user', userId);
  async function verify(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await api.post('/auth/verify-otp', { userId, otp });
      sessionStorage.removeItem('socialconnect-pending-user');
      navigate('/login', { replace: true, state: { verified: true } });
    } catch (requestError) { setError(errorMessage(requestError, 'Could not verify this code.')); }
    finally { setBusy(false); }
  }
  async function resend() {
    setError('');
    try { const { data } = await api.post('/auth/send-otp', { userId }); setMessage(data.message); if (data.developmentOtp) setOtp(data.developmentOtp); }
    catch (requestError) { setError(errorMessage(requestError)); }
  }
  return <section className="surface auth-page">
    <Link className="brand auth-brand" to="/login"><span className="brand-mark"><Sparkles size={18} /></span>Vibely</Link>
    <h1>Verify your number.</h1><p>{message}</p>
    {error && <div className="error-banner">{error}</div>}
    {!userId && <label className="field-label" style={{ marginBottom: 13 }}>Account ID<input className="text-input" value={userId} onChange={(event) => setUserId(event.target.value)} required /></label>}
    <form className="form-stack" onSubmit={verify}>
      <label className="field-label">6-digit verification code<input className="text-input verify-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} required /></label>
      {location.state?.developmentOtp && <div className="development-code">Local development code: <strong>{location.state.developmentOtp}</strong></div>}
      <button className="button-primary" disabled={busy || !userId}>{busy ? 'Verifying…' : 'Verify and activate'}</button>
    </form>
    <div className="auth-switch"><button className="text-link" onClick={resend} disabled={!userId}>Send a new code</button> · <Link to="/login">Back to sign in</Link></div>
  </section>;
}