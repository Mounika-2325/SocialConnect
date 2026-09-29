import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import api, { errorMessage } from '../services/api';

const initialForm = { name: '', username: '', email: '', phone: '', password: '', confirmPassword: '' };

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  function update(event) { setForm((previous) => ({ ...previous, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault(); setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (form.password.length < 8) return setError('Use at least 8 characters for your password.');
    setBusy(true);
    let account;
    try {
      const { data } = await api.post('/auth/register', form);
      account = data;
      const { data: otp } = await api.post('/auth/send-otp', { userId: account.userId });
      navigate('/verify-otp', { state: { userId: account.userId, developmentOtp: otp.developmentOtp, message: otp.message } });
    } catch (requestError) {
      if (account?.userId) navigate('/verify-otp', { state: { userId: account.userId, message: 'Account created. Request a code to complete phone verification.' } });
      else setError(errorMessage(requestError, 'Could not create the account.'));
    }
    finally { setBusy(false); }
  }
  return <section className="surface auth-page">
    <Link className="brand auth-brand" to="/login"><span className="brand-mark"><Sparkles size={18} /></span>Vibely</Link>
    <h1>Find your people.</h1><p>Create your account. We’ll send a one-time code to verify your mobile number.</p>
    {error && <div className="error-banner">{error}</div>}
    <form className="form-stack" onSubmit={submit}>
      <label className="field-label">Full name<input className="text-input" name="name" value={form.name} onChange={update} maxLength={80} autoComplete="name" required /></label>
      <div className="form-grid"><label className="field-label">Username<input className="text-input" name="username" value={form.username} onChange={update} pattern="[A-Za-z0-9_]{3,24}" title="3–24 letters, numbers, or underscores" autoComplete="username" required /></label><label className="field-label">Email<input className="text-input" type="email" name="email" value={form.email} onChange={update} autoComplete="email" required /></label></div>
      <label className="field-label">Mobile number<input className="text-input" type="tel" name="phone" placeholder="+15551234567" value={form.phone} onChange={update} autoComplete="tel" required /><span style={{ color: '#778580', fontSize: 12, fontWeight: 400 }}>Include + and your country code for SMS verification.</span></label>
      <div className="form-grid"><label className="field-label">Password<span className="password-field"><input className="text-input" type={showPassword ? 'text' : 'password'} name="password" minLength={8} value={form.password} onChange={update} autoComplete="new-password" required /><button className="password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button></span></label><label className="field-label">Confirm password<span className="password-field"><input className="text-input" type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" minLength={8} value={form.confirmPassword} onChange={update} autoComplete="new-password" required /><button className="password-toggle" type="button" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} title={showConfirmPassword ? 'Hide password' : 'Show password'} onClick={() => setShowConfirmPassword((visible) => !visible)}>{showConfirmPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button></span></label></div>
      <button className="button-primary" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
    </form>
    <div className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></div>
  </section>;
}