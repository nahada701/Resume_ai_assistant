import React, { useState } from 'react';
import { Wand2, Copy } from 'lucide-react';
import { useStreamingText } from '../hooks/useStreamingText';
import { showToast } from './Toast';

const SECTION_OPTIONS = ['Experience', 'Summary / Objective', 'Skills', 'Education', 'Projects', 'Achievements'];

export default function ImproveTab({ resumeText, isMobile }) {
  const [section, setSection] = useState('Experience');
  const [content, setContent] = useState('');
  const [role, setRole] = useState('');
  const { text, loading, stream } = useStreamingText();

  const improve = () => {
    if (!content.trim()) return;
    stream('/improve-section', { section_name: section, section_content: content, target_role: role || null });
  };

  const copy = () => { navigator.clipboard.writeText(text); showToast('Copied to clipboard!', 'success'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>AI Section Rewriter</div>
        <div style={{ color: '#718096', fontSize: 13, marginBottom: 14 }}>Paste any section and get an AI-powered rewrite with stronger language, quantified achievements, and ATS optimization.</div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 5 }}>Section Type</label>
            <select className="input" value={section} onChange={e => setSection(e.target.value)} style={{ background: '#0f1117', cursor: 'pointer' }}>
              {SECTION_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 5 }}>Target Role (optional)</label>
            <input className="input" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Software Engineer" />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 5 }}>Original Content</label>
          <textarea className="input" value={content} onChange={e => setContent(e.target.value)}
            placeholder="Paste the section you want to improve..."
            style={{ minHeight: isMobile ? 100 : 130 }} />
        </div>

        <button className="btn-primary" onClick={improve} disabled={loading || !content.trim()}>
          {loading
            ? <><span className="spinner" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff3', borderTopColor: '#fff', borderRadius: '50%' }} /> Rewriting...</>
            : <><Wand2 size={15} /> Improve Section</>}
        </button>
      </div>

      {(text || loading) && (
        <div className="card fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, color: '#7f9cf5', fontSize: 14 }}>Improved Version</div>
            {text && (
              <button className="btn-secondary" onClick={copy} style={{ padding: '7px 12px', fontSize: 12 }}>
                <Copy size={13} /> Copy
              </button>
            )}
          </div>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.7, color: '#e2e8f0' }} className={loading ? 'typing-cursor' : ''}>
            {text || <span className="pulse" style={{ color: '#4a5568' }}>Generating...</span>}
          </div>
        </div>
      )}
    </div>
  );
}
