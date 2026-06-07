import React, { useState, useEffect } from 'react';
import { FileSignature, Copy, Download } from 'lucide-react';
import { useStreamingText } from '../hooks/useStreamingText';
import { showToast } from './Toast';

export default function CoverLetterTab({ resumeText, parsedData, isMobile }) {
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const { text, loading, stream } = useStreamingText();

  useEffect(() => {
    if (parsedData?.name && !name) setName(parsedData.name);
  }, [parsedData]);

  const generate = () => {
    if (!resumeText || !company || !name || !jobDesc) return;
    stream('/cover-letter', { resume_text: resumeText, job_description: jobDesc, company_name: company, applicant_name: name });
  };

  const copy = () => { navigator.clipboard.writeText(text); showToast('Cover letter copied!', 'success'); };

  const download = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${company.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded!', 'success');
  };

  const valid = resumeText && company && name && jobDesc;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Cover Letter Generator</div>
        <div style={{ color: '#718096', fontSize: 13, marginBottom: 14 }}>Generate a personalized, compelling cover letter tailored to the specific role and company.</div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 5 }}>
              Your Full Name *
              {parsedData?.name && <span style={{ color: '#48bb78', marginLeft: 6, fontSize: 11 }}>✓ auto-filled</span>}
            </label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 5 }}>Company Name *</label>
            <input className="input" value={company} onChange={e => setCompany(e.target.value)} placeholder="Google, Microsoft..." />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 5 }}>Job Description *</label>
          <textarea className="input" value={jobDesc} onChange={e => setJobDesc(e.target.value)}
            placeholder="Paste the full job description here..."
            style={{ minHeight: isMobile ? 100 : 120 }} />
        </div>

        <button className="btn-primary" onClick={generate} disabled={loading || !valid}>
          {loading
            ? <><span className="spinner" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff3', borderTopColor: '#fff', borderRadius: '50%' }} /> Writing...</>
            : <><FileSignature size={15} /> Generate Cover Letter</>}
        </button>
        {!resumeText && <div style={{ fontSize: 12, color: '#718096', marginTop: 8 }}>Upload your resume first.</div>}
      </div>

      {(text || loading) && (
        <div className="card fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontWeight: 600, color: '#7f9cf5', fontSize: 14 }}>Cover Letter</div>
            {text && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-secondary" onClick={copy} style={{ padding: '7px 12px', fontSize: 12 }}><Copy size={13} /> Copy</button>
                <button className="btn-secondary" onClick={download} style={{ padding: '7px 12px', fontSize: 12 }}><Download size={13} /> Save</button>
              </div>
            )}
          </div>
          <div style={{
            whiteSpace: 'pre-wrap', fontSize: isMobile ? 13 : 14, lineHeight: 1.8, color: '#e2e8f0',
            padding: isMobile ? 14 : 20, background: '#0f1117', borderRadius: 8, border: '1px solid #2d3748',
            fontFamily: 'Georgia, serif',
          }} className={loading ? 'typing-cursor' : ''}>
            {text || <span className="pulse" style={{ color: '#4a5568' }}>Generating cover letter...</span>}
          </div>
        </div>
      )}
    </div>
  );
}
