import { useState } from 'react';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../services/api';

export default function CreatePost() {
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function publish(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try { await api.post('/posts', { text, image }); navigate('/'); }
    catch (requestError) { setError(errorMessage(requestError, 'Could not publish your post.')); }
    finally { setBusy(false); }
  }
  return <section className="create-page">
    <div className="section-row"><div><Link className="text-link" to="/"><ArrowLeft size={16} /> Back to feed</Link><h1 className="page-title" style={{ marginTop: 14 }}>Share a moment</h1><p className="page-subtitle">A thought, a photo, or something you learned today.</p></div></div>
    {error && <div className="error-banner">{error}</div>}
    <form className="surface edit-profile-form" onSubmit={publish}>
      <label className="field-label">Your post<textarea className="text-area" placeholder="What’s on your mind?" value={text} onChange={(event) => setText(event.target.value)} maxLength={2000} required /></label>
      <label className="field-label"><span><ImagePlus size={16} /> Image URL <span style={{ color: '#82918b', fontWeight: 400 }}>(optional)</span></span><input className="text-input" type="url" placeholder="https://example.com/photo.jpg" value={image} onChange={(event) => setImage(event.target.value)} /></label>
      {image && <img src={image} alt="Post preview" style={{ width: '100%', maxHeight: 330, objectFit: 'cover', borderRadius: 6 }} onError={() => setError('This image URL could not be previewed.')} />}
      <div className="section-row" style={{ margin: 0 }}><span style={{ color: '#82918b', fontSize: 12 }}>{text.length}/2,000</span><button className="button-primary" disabled={busy || !text.trim()}>{busy ? 'Publishing…' : 'Publish post'}</button></div>
    </form>
  </section>;
}