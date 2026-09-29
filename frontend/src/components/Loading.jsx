import { LoaderCircle } from 'lucide-react';

export default function Loading({ label = 'Loading…' }) {
  return <div className="loading-state"><LoaderCircle size={18} className="spin" />{label}</div>;
}