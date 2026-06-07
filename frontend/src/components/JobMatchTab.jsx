import React, { useState } from 'react';
import { Target, CheckCircle, XCircle, Lightbulb, HelpCircle, RefreshCw } from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import { JobMatchSkeleton } from './Skeleton';
import { api } from '../hooks/useStreamingText';

function verdictColor(v) {
  if (v === 'Strong Match') return '#48bb78';
  if (v === 'Good Match') return '#68d391';
  if (v === 'Partial Match') return '#ed8936';
  return '#fc8181';
}

export default function JobMatchTab({ resumeText, isMobile }) {
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const match = async () => {
    if (!resumeText || !jobDesc.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await api.post('/job-match', { resume_text: resumeText, job_description: jobDesc });
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Match failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Job Match Analyzer</div>
        <div style={{ color: '#718096', fontSize: 13, marginBottom: 14 }}>See how well your resume matches a job description and get interview prep tips.</div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 5 }}>Job Description *</label>
          <textarea className="input" value={jobDesc} onChange={e => setJobDesc(e.target.value)}
            placeholder="Paste the full job description..."
            style={{ minHeight: isMobile ? 100 : 130 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={match} disabled={loading || !resumeText || !jobDesc.trim()}>
            {loading
              ? <><span className="spinner" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff3', borderTopColor: '#fff', borderRadius: '50%' }} /> Analyzing...</>
              : <><Target size={15} /> Check Match</>}
          </button>
          {error && <button className="btn-secondary" onClick={match} style={{ fontSize: 13 }}><RefreshCw size={13} /> Retry</button>}
        </div>
        {error && <div style={{ color: '#fc8181', fontSize: 13, marginTop: 10 }}>{error}</div>}
      </div>

      {loading && <JobMatchSkeleton isMobile={isMobile} />}

      {result && !loading && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <ScoreGauge score={result.match_score} label="Match Score" size={isMobile ? 100 : 130} />
            <div style={{ marginTop: 10, fontWeight: 700, fontSize: 18, color: verdictColor(result.verdict) }}>
              {result.verdict}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontWeight: 600, color: '#68d391', fontSize: 13 }}>
                <CheckCircle size={14} /> Matching Skills
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.matching_skills?.map((s, i) => <span key={i} className="badge badge-green">{s}</span>)}
              </div>
            </div>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontWeight: 600, color: '#fc8181', fontSize: 13 }}>
                <XCircle size={14} /> Missing Skills
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.missing_skills?.map((s, i) => <span key={i} className="badge badge-red">{s}</span>)}
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontWeight: 600, color: '#7f9cf5', fontSize: 13 }}>
              <Lightbulb size={14} /> Recommendations
            </div>
            {result.recommendations?.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#667eea', flexShrink: 0, marginTop: 7 }} />
                <p style={{ fontSize: 13, color: '#a0aec0', lineHeight: 1.6 }}>{r}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontWeight: 600, color: '#f6ad55', fontSize: 13 }}>
              <HelpCircle size={14} /> Likely Interview Questions
            </div>
            {result.interview_prep?.map((q, i) => (
              <div key={i} style={{ padding: '10px 12px', background: '#0f1117', borderRadius: 8, marginBottom: 8, fontSize: 13, color: '#e2e8f0', borderLeft: '3px solid #ed8936' }}>
                {i + 1}. {q}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
