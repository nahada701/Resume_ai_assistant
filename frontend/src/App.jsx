import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Wand2, FileSignature, Target, MessageCircle, Brain, Linkedin, List } from 'lucide-react';
import ResumeUploader from './components/ResumeUploader';
import AnalyzeTab from './components/AnalyzeTab';
import ImproveTab from './components/ImproveTab';
import CoverLetterTab from './components/CoverLetterTab';
import JobMatchTab from './components/JobMatchTab';
import ChatTab from './components/ChatTab';
import LinkedInTab from './components/LinkedInTab';
import BulletsTab from './components/BulletsTab';
import { ToastContainer } from './components/Toast';

const TABS = [
  { id: 'analyze', label: 'Analyze', icon: BarChart3 },
  { id: 'improve', label: 'Improve', icon: Wand2 },
  { id: 'cover', label: 'Cover Letter', icon: FileSignature },
  { id: 'match', label: 'Job Match', icon: Target },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'bullets', label: 'Bullets', icon: List },
  { id: 'chat', label: 'AI Coach', icon: MessageCircle },
];

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

export default function App() {
  const [resumeText, setResumeText] = useState(() => localStorage.getItem('resume_text') || '');
  const [parsedData, setParsedData] = useState(null);
  const [activeTab, setActiveTab] = useState('analyze');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const width = useWindowWidth();
  const isMobile = width < 768;

  const handleResumeLoaded = useCallback((text) => {
    setResumeText(text);
    if (text) {
      localStorage.setItem('resume_text', text);
      if (isMobile) setSidebarOpen(false);
    } else {
      localStorage.removeItem('resume_text');
      localStorage.removeItem('resume_ai_analyze_result');
      setParsedData(null);
    }
  }, [isMobile]);

  const px = isMobile ? '16px' : '20px';

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #1e2334', padding: isMobile ? '12px 0' : '14px 0', position: 'sticky', top: 0, background: '#0f1117', zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: `0 ${px}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Brain size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: isMobile ? 15 : 18, lineHeight: 1.2 }} className="gradient-text">Resume AI</div>
            {!isMobile && <div style={{ fontSize: 11, color: '#4a5568' }}>Powered by LLaMA 3.3 · Groq</div>}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {resumeText && !isMobile && (
              <span className="badge badge-green" style={{ fontSize: 11 }}>Resume Loaded</span>
            )}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(o => !o)}
                style={{
                  background: resumeText ? 'rgba(72,187,120,0.15)' : '#1a1d27',
                  border: `1px solid ${resumeText ? 'rgba(72,187,120,0.4)' : '#2d3748'}`,
                  borderRadius: 8, padding: '7px 12px', color: resumeText ? '#68d391' : '#a0aec0',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {resumeText ? (sidebarOpen ? 'Hide Resume' : '✓ Resume') : '+ Upload'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: `20px ${px}`, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', gap: 20, alignItems: 'start' }}>

        {/* Sidebar — always shown on desktop, toggle on mobile */}
        {(!isMobile || sidebarOpen) && (
          <div style={{ position: isMobile ? 'static' : 'sticky', top: 72 }}>
            <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: '#4a5568', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Your Resume</div>
            <ResumeUploader resumeText={resumeText} onResumeLoaded={handleResumeLoaded} onParsed={setParsedData} />

            {parsedData && (
              <div className="card fade-in" style={{ marginTop: 14, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#4a5568', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Parsed Info</div>
                {parsedData.name && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 2 }}>NAME</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{parsedData.name}</div>
                  </div>
                )}
                {parsedData.email && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 2 }}>EMAIL</div>
                    <div style={{ fontSize: 12, color: '#a0aec0', wordBreak: 'break-all' }}>{parsedData.email}</div>
                  </div>
                )}
                {parsedData.skills?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 5 }}>SKILLS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {parsedData.skills.slice(0, 10).map((s, i) => (
                        <span key={i} className="badge badge-blue" style={{ fontSize: 11, padding: '2px 7px' }}>{s}</span>
                      ))}
                      {parsedData.skills.length > 10 && <span style={{ fontSize: 11, color: '#4a5568' }}>+{parsedData.skills.length - 10} more</span>}
                    </div>
                  </div>
                )}
                {parsedData.experience?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 5 }}>EXPERIENCE</div>
                    {parsedData.experience.slice(0, 3).map((e, i) => (
                      <div key={i} style={{ marginBottom: 6, paddingLeft: 8, borderLeft: '2px solid #2d3748' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{e.title}</div>
                        <div style={{ fontSize: 11, color: '#718096' }}>{e.company}{e.dates && ` · ${e.dates}`}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {resumeText && !parsedData && (
              <div className="card" style={{ marginTop: 14, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#4a5568', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Preview</div>
                <div style={{ fontSize: 11, color: '#718096', lineHeight: 1.6, maxHeight: 160, overflow: 'hidden', position: 'relative' }}>
                  {resumeText.slice(0, 300)}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 36, background: 'linear-gradient(transparent, #1a1d27)' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main content — always shown */}
        <div>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 3, background: '#1a1d27', padding: 4, borderRadius: 10, marginBottom: 16, border: '1px solid #2d3748', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); if (isMobile) setSidebarOpen(false); }}
                  style={{
                    flex: '0 0 auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    padding: isMobile ? '9px 11px' : '8px 12px',
                    borderRadius: 7, border: 'none', cursor: 'pointer',
                    fontSize: isMobile ? 12 : 12, fontWeight: 500,
                    background: active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                    color: active ? 'white' : '#718096',
                    transition: 'all 0.2s', whiteSpace: 'nowrap',
                    minWidth: 44, minHeight: 44,
                  }}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'analyze' && <AnalyzeTab resumeText={resumeText} isMobile={isMobile} />}
          {activeTab === 'improve' && <ImproveTab resumeText={resumeText} isMobile={isMobile} />}
          {activeTab === 'cover' && <CoverLetterTab resumeText={resumeText} parsedData={parsedData} isMobile={isMobile} />}
          {activeTab === 'match' && <JobMatchTab resumeText={resumeText} isMobile={isMobile} />}
          {activeTab === 'linkedin' && <LinkedInTab resumeText={resumeText} isMobile={isMobile} />}
          {activeTab === 'bullets' && <BulletsTab resumeText={resumeText} isMobile={isMobile} />}
          {activeTab === 'chat' && <ChatTab resumeText={resumeText} isMobile={isMobile} />}
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '24px', color: '#2d3748', fontSize: 12, borderTop: '1px solid #1e2334', marginTop: 24 }}>
        Resume AI Assistant · Built with React + FastAPI + Groq
      </footer>
      <ToastContainer />
    </div>
  );
}
