import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Wand2, FileSignature, Target, MessageCircle, Brain, Linkedin, List, Menu, X, ChevronDown } from 'lucide-react';
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
  { id: 'analyze',  label: 'Analyze',      icon: BarChart3 },
  { id: 'improve',  label: 'Improve',       icon: Wand2 },
  { id: 'cover',    label: 'Cover Letter',  icon: FileSignature },
  { id: 'match',    label: 'Job Match',     icon: Target },
  { id: 'linkedin', label: 'LinkedIn',      icon: Linkedin },
  { id: 'bullets',  label: 'Bullets',       icon: List },
  { id: 'chat',     label: 'AI Coach',      icon: MessageCircle },
];

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return width;
}

export default function App() {
  const [resumeText, setResumeText]   = useState(() => localStorage.getItem('resume_text') || '');
  const [parsedData, setParsedData]   = useState(null);
  const [activeTab, setActiveTab]     = useState('analyze');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const width    = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

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

  const sidebarWidth = isTablet ? 260 : 300;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f1117', overflow: 'hidden' }}>

      {/* ── Header ─────────────────────────────────── */}
      <header style={{
        flexShrink: 0, borderBottom: '1px solid #1e2334',
        padding: isMobile ? '0 16px' : '0 24px',
        height: isMobile ? 56 : 60,
        display: 'flex', alignItems: 'center', gap: 12,
        background: '#0a0c13', zIndex: 200,
      }}>
        {/* Logo */}
        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Brain size={18} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: isMobile ? 15 : 18, lineHeight: 1.2 }} className="gradient-text">Resume AI</div>
          {!isMobile && <div style={{ fontSize: 11, color: '#4a5568' }}>Powered by LLaMA 3.3 · Groq</div>}
        </div>

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          {resumeText && !isMobile && (
            <span className="badge badge-green" style={{ fontSize: 11 }}>Resume Loaded</span>
          )}

          {/* Mobile: sidebar toggle */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{
                background: resumeText ? 'rgba(72,187,120,0.12)' : '#1a1d27',
                border: `1px solid ${resumeText ? 'rgba(72,187,120,0.35)' : '#2d3748'}`,
                borderRadius: 8, padding: '6px 12px',
                color: resumeText ? '#68d391' : '#a0aec0',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {sidebarOpen ? <X size={13} /> : (resumeText ? '✓ Resume' : '+ Upload')}
            </button>
          )}
        </div>
      </header>

      {/* ── Body ───────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Sidebar ── desktop always visible, mobile collapsible */}
        {!isMobile ? (
          <aside style={{
            width: sidebarWidth, flexShrink: 0,
            borderRight: '1px solid #1e2334',
            overflowY: 'auto', padding: '20px 16px',
            background: '#0a0c13',
          }}>
            <SidebarContent parsedData={parsedData} resumeText={resumeText} onResumeLoaded={handleResumeLoaded} onParsed={setParsedData} />
          </aside>
        ) : (
          sidebarOpen && (
            <div style={{
              position: 'absolute', top: 56, left: 0, right: 0, zIndex: 150,
              background: '#0a0c13', borderBottom: '1px solid #1e2334',
              padding: '16px', maxHeight: 'calc(100vh - 56px)', overflowY: 'auto',
            }}>
              <SidebarContent parsedData={parsedData} resumeText={resumeText} onResumeLoaded={handleResumeLoaded} onParsed={setParsedData} />
            </div>
          )
        )}

        {/* ── Main content ── */}
        <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
          onClick={() => isMobile && sidebarOpen && setSidebarOpen(false)}>

          {/* Tab bar */}
          <div style={{
            flexShrink: 0,
            display: 'flex', gap: 3,
            background: '#0a0c13',
            padding: isMobile ? '8px 12px' : '10px 20px',
            borderBottom: '1px solid #1e2334',
            overflowX: 'auto', WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none', msOverflowStyle: 'none',
          }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); if (isMobile) setSidebarOpen(false); }}
                  style={{
                    flex: '0 0 auto',
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: isMobile ? '8px 12px' : '8px 16px',
                    borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: isMobile ? 12 : 13, fontWeight: 500,
                    background: active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                    color: active ? 'white' : '#718096',
                    transition: 'all 0.2s', whiteSpace: 'nowrap',
                    minHeight: 40,
                  }}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, padding: isMobile ? '16px 14px' : '24px 28px', overflowY: 'auto' }}>
            {activeTab === 'analyze'  && <AnalyzeTab     resumeText={resumeText} isMobile={isMobile} />}
            {activeTab === 'improve'  && <ImproveTab     resumeText={resumeText} isMobile={isMobile} />}
            {activeTab === 'cover'    && <CoverLetterTab resumeText={resumeText} parsedData={parsedData} isMobile={isMobile} />}
            {activeTab === 'match'    && <JobMatchTab    resumeText={resumeText} isMobile={isMobile} />}
            {activeTab === 'linkedin' && <LinkedInTab    resumeText={resumeText} isMobile={isMobile} />}
            {activeTab === 'bullets'  && <BulletsTab     resumeText={resumeText} isMobile={isMobile} />}
            {activeTab === 'chat'     && <ChatTab        resumeText={resumeText} isMobile={isMobile} />}
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}

/* ── Sidebar content (shared between desktop aside & mobile drawer) ── */
function SidebarContent({ parsedData, resumeText, onResumeLoaded, onParsed }) {
  return (
    <>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#4a5568', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Your Resume</div>
      <ResumeUploader resumeText={resumeText} onResumeLoaded={onResumeLoaded} onParsed={onParsed} />

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
                {parsedData.skills.length > 10 && (
                  <span style={{ fontSize: 11, color: '#4a5568' }}>+{parsedData.skills.length - 10} more</span>
                )}
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
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 36, background: 'linear-gradient(transparent, #0a0c13)' }} />
          </div>
        </div>
      )}
    </>
  );
}
