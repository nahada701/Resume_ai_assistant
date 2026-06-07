import React, { useState } from 'react';
import { Linkedin, Copy, RefreshCw, PenLine, User } from 'lucide-react';
import { useStreamingText } from '../hooks/useStreamingText';
import { showToast } from './Toast';

/* ─── Profile Optimizer ─────────────────────────────────── */

function parseSection(text, header) {
  const lines = text.split('\n');
  let inSection = false;
  const content = [];
  for (const line of lines) {
    if (line.startsWith(`## ${header}`)) { inSection = true; continue; }
    if (inSection && line.startsWith('## ')) break;
    if (inSection) content.push(line);
  }
  return content.join('\n').trim();
}

function SectionCard({ title, content, color }) {
  const copy = () => { navigator.clipboard.writeText(content); showToast(`${title} copied!`, 'success'); };
  if (!content) return null;
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontWeight: 600, color, fontSize: 13 }}>{title}</div>
        <button className="btn-secondary" onClick={copy} style={{ padding: '5px 10px', fontSize: 12 }}>
          <Copy size={12} /> Copy
        </button>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.7, color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{content}</div>
    </div>
  );
}

function ProfileOptimizer({ resumeText }) {
  const [role, setRole] = useState('');
  const { text, loading, stream, setText } = useStreamingText();

  const generate = () => {
    if (!resumeText) return;
    setText('');
    stream('/linkedin-optimize', { resume_text: resumeText, target_role: role || null });
  };

  const headline = parseSection(text, 'HEADLINE');
  const about = parseSection(text, 'ABOUT');
  const skills = parseSection(text, 'FEATURED SKILLS');
  const message = parseSection(text, 'CONNECTION MESSAGE');
  const hasResults = headline || about || skills || message;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ marginBottom: 4 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 6 }}>Target Role (optional)</label>
        <input className="input" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Product Manager, Data Scientist..." />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-primary" onClick={generate} disabled={loading || !resumeText}>
          {loading
            ? <><span className="spinner" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff3', borderTopColor: '#fff', borderRadius: '50%' }} /> Optimizing...</>
            : <><Linkedin size={15} /> Generate Profile Content</>}
        </button>
        {hasResults && !loading && (
          <button className="btn-secondary" onClick={generate} style={{ fontSize: 13 }}>
            <RefreshCw size={13} /> Regenerate
          </button>
        )}
      </div>
      {!resumeText && <div style={{ fontSize: 12, color: '#718096' }}>Upload your resume first.</div>}

      {loading && !hasResults && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {['Headline', 'About', 'Skills', 'Message'].map(s => (
            <div key={s} className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 8, fontWeight: 600 }}>{s}</div>
              <div className="skeleton" style={{ height: 13, borderRadius: 6, marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 13, borderRadius: 6, width: '65%' }} />
            </div>
          ))}
        </div>
      )}

      {hasResults && (
        <div className="fade-in">
          <SectionCard title="Headline" content={headline} color="#60a5fa" />
          <SectionCard title="About Section" content={about} color="#7f9cf5" />
          <SectionCard title="Featured Skills" content={skills} color="#68d391" />
          <SectionCard title="Connection Message" content={message} color="#f6ad55" />
        </div>
      )}
    </div>
  );
}

/* ─── Post Creator ───────────────────────────────────────── */

const TONES = ['Professional', 'Casual', 'Inspirational', 'Educational', 'Storytelling'];
const LENGTHS = [
  { id: 'short', label: 'Short', desc: '~150 words' },
  { id: 'medium', label: 'Medium', desc: '~300 words' },
  { id: 'long', label: 'Long', desc: '~450 words' },
];

const TOPIC_IDEAS = [
  'A lesson I learned from failure',
  "Why AI won't replace human creativity",
  'The 3 habits that changed my career',
  'What nobody tells you about job hunting',
  'How I went from zero to my first role in tech',
];

function PostCreator({ resumeText, isMobile }) {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('medium');
  const { text, loading, stream, setText } = useStreamingText();

  const generate = (t) => {
    const useTopic = t || topic;
    if (!useTopic.trim()) return;
    if (t) setTopic(t);
    setText('');
    stream('/linkedin-post', { topic: useTopic, tone, length, resume_text: resumeText || null });
  };

  const copy = () => { navigator.clipboard.writeText(text); showToast('Post copied!', 'success'); };

  const charCount = text.length;
  const charColor = charCount > 3000 ? '#fc8181' : charCount > 2000 ? '#ed8936' : '#68d391';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Topic */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 6 }}>Post Topic *</label>
        <textarea className="input" value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="e.g. 'The biggest mistake junior developers make' or 'How I landed my dream job in 30 days'..."
          style={{ minHeight: 72 }} />
      </div>

      {/* Quick ideas */}
      <div>
        <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 8, fontWeight: 600 }}>QUICK IDEAS</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {TOPIC_IDEAS.map((idea, i) => (
            <button key={i} onClick={() => generate(idea)}
              style={{ background: '#0f1117', border: '1px solid #2d3748', borderRadius: 20, padding: '5px 12px', color: '#a0aec0', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.target.style.borderColor = '#667eea'; e.target.style.color = '#e2e8f0'; }}
              onMouseLeave={e => { e.target.style.borderColor = '#2d3748'; e.target.style.color = '#a0aec0'; }}>
              {idea}
            </button>
          ))}
        </div>
      </div>

      {/* Tone + Length */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 6 }}>Tone</label>
          <select className="input" value={tone} onChange={e => setTone(e.target.value)} style={{ background: '#0f1117', cursor: 'pointer' }}>
            {TONES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 6 }}>Length</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {LENGTHS.map(l => (
              <button key={l.id} onClick={() => setLength(l.id)}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 8, border: `1px solid ${length === l.id ? '#667eea' : '#2d3748'}`,
                  background: length === l.id ? 'rgba(102,126,234,0.15)' : '#0f1117',
                  color: length === l.id ? '#7f9cf5' : '#718096', cursor: 'pointer', fontSize: 12,
                  transition: 'all 0.15s', textAlign: 'center',
                }}>
                <div style={{ fontWeight: 600 }}>{l.label}</div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>{l.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button className="btn-primary" onClick={() => generate()} disabled={loading || !topic.trim()} style={{ alignSelf: 'flex-start' }}>
        {loading
          ? <><span className="spinner" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff3', borderTopColor: '#fff', borderRadius: '50%' }} /> Writing post...</>
          : <><PenLine size={15} /> Create Post</>}
      </button>

      {(text || loading) && (
        <div className="card fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 600, color: '#7f9cf5', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Linkedin size={15} color="#0077b5" /> LinkedIn Post
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {text && <span style={{ fontSize: 11, color: charColor }}>{charCount} chars</span>}
              {text && (
                <>
                  <button className="btn-secondary" onClick={copy} style={{ padding: '6px 12px', fontSize: 12 }}>
                    <Copy size={13} /> Copy
                  </button>
                  <button className="btn-secondary" onClick={() => generate()} style={{ padding: '6px 10px', fontSize: 12 }}>
                    <RefreshCw size={13} />
                  </button>
                </>
              )}
            </div>
          </div>
          <div style={{
            whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.8, color: '#e2e8f0',
            padding: '16px 18px', background: '#0f1117', borderRadius: 8,
            border: '1px solid #2d3748', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }} className={loading ? 'typing-cursor' : ''}>
            {text || <span className="pulse" style={{ color: '#4a5568' }}>Writing your post...</span>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Tab ───────────────────────────────────────────── */

export default function LinkedInTab({ resumeText, isMobile }) {
  const [mode, setMode] = useState('post');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Mode switcher */}
      <div style={{ display: 'flex', gap: 3, background: '#1a1d27', padding: 4, borderRadius: 10, border: '1px solid #2d3748', alignSelf: 'flex-start' }}>
        <button onClick={() => setMode('post')}
          style={{ padding: '8px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
            background: mode === 'post' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
            color: mode === 'post' ? 'white' : '#718096', transition: 'all 0.2s' }}>
          <PenLine size={14} /> Post Creator
        </button>
        <button onClick={() => setMode('profile')}
          style={{ padding: '8px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
            background: mode === 'profile' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
            color: mode === 'profile' ? 'white' : '#718096', transition: 'all 0.2s' }}>
          <User size={14} /> Profile Optimizer
        </button>
      </div>

      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', background: 'rgba(0,119,181,0.08)', borderColor: 'rgba(0,119,181,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#0077b5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Linkedin size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {mode === 'post' ? 'LinkedIn Post Creator' : 'LinkedIn Profile Optimizer'}
            </div>
            <div style={{ color: '#718096', fontSize: 12 }}>
              {mode === 'post'
                ? 'Give a topic → get a scroll-stopping LinkedIn post with the right tone, length & hashtags.'
                : 'Generate a recruiter-ready headline, About section, skills, and connection message from your resume.'}
            </div>
          </div>
        </div>
      </div>

      {mode === 'post' ? <PostCreator resumeText={resumeText} isMobile={isMobile} /> : <ProfileOptimizer resumeText={resumeText} isMobile={isMobile} />}
    </div>
  );
}
