import React, { useState } from 'react';
import { List, Copy, Sparkles } from 'lucide-react';
import { useStreamingText } from '../hooks/useStreamingText';
import { showToast } from './Toast';

function parseBullets(text) {
  return text
    .split('\n')
    .map(l => l.replace(/^\d+\.\s*/, '').trim())
    .filter(l => l.length > 20);
}

export default function BulletsTab({ resumeText, isMobile }) {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [years, setYears] = useState('');
  const { text, loading, stream, setText } = useStreamingText();

  const bullets = parseBullets(text);

  const generate = () => {
    if (!jobTitle || !description) return;
    setText('');
    stream('/generate-bullets', {
      job_title: jobTitle, company, description,
      years_exp: years ? parseInt(years) : null,
    });
  };

  const copyAll = () => { navigator.clipboard.writeText(bullets.map(b => `• ${b}`).join('\n')); showToast('All bullets copied!', 'success'); };
  const copyOne = (b) => { navigator.clipboard.writeText(`• ${b}`); showToast('Copied!', 'success'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <List size={17} color="#7f9cf5" />
          <div style={{ fontWeight: 700, fontSize: 15 }}>Bullet Point Generator</div>
        </div>
        <div style={{ color: '#718096', fontSize: 13, marginBottom: 14 }}>
          Generate 6 strong, quantified achievement bullet points for any role using the STAR method.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 5 }}>Job Title *</label>
            <input className="input" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 5 }}>Company</label>
            <input className="input" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google" />
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 5 }}>Role Description / Context *</label>
          <textarea className="input" value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Describe your responsibilities, projects, technologies, team size..."
            style={{ minHeight: isMobile ? 80 : 100 }} />
        </div>

        <div style={{ marginBottom: 14, maxWidth: isMobile ? '100%' : '50%' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 5 }}>Years of Experience</label>
          <input className="input" type="number" min="0" max="30" value={years} onChange={e => setYears(e.target.value)} placeholder="e.g. 3" />
        </div>

        <button className="btn-primary" onClick={generate} disabled={loading || !jobTitle || !description}>
          {loading
            ? <><span className="spinner" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff3', borderTopColor: '#fff', borderRadius: '50%' }} /> Generating...</>
            : <><Sparkles size={15} /> Generate Bullets</>}
        </button>
      </div>

      {(bullets.length > 0 || (loading && text)) && (
        <div className="card fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 600, color: '#7f9cf5', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <List size={14} /> Achievement Bullets
            </div>
            {bullets.length > 0 && (
              <button className="btn-secondary" onClick={copyAll} style={{ padding: '7px 12px', fontSize: 12 }}>
                <Copy size={12} /> Copy All
              </button>
            )}
          </div>

          {bullets.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bullets.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', background: '#0f1117', borderRadius: 8, border: '1px solid #2d3748' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(102,126,234,0.2)', color: '#7f9cf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.6, flex: 1 }}>• {b}</span>
                  <button onClick={() => copyOne(b)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5568', padding: '4px', flexShrink: 0, minWidth: 28, minHeight: 28 }}>
                    <Copy size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#4a5568', fontSize: 13 }} className="pulse">Generating bullet points...</div>
          )}
        </div>
      )}
    </div>
  );
}
