import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  'What are the strongest parts of my resume?',
  'What roles am I best suited for?',
  'How can I improve my chances of getting interviews?',
  'Write a 30-second elevator pitch based on my resume.',
  'What salary range should I target?',
  'How does my resume compare to industry standards?',
];

export default function ChatTab({ resumeText }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || !resumeText || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    const history = [...messages, userMsg];
    setMessages([...history, { role: 'assistant', content: '', streaming: true }]);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText, message: msg, history: messages }),
      });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value);
        setMessages([...history, { role: 'assistant', content: full, streaming: true }]);
      }
      setMessages([...history, { role: 'assistant', content: full, streaming: false }]);
    } catch (e) {
      setMessages([...history, { role: 'assistant', content: 'Error: ' + e.message, streaming: false }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
      {!resumeText && (
        <div className="card" style={{ textAlign: 'center', color: '#718096', padding: 32 }}>
          <Bot size={40} color="#4a5568" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Upload your resume to start chatting</div>
          <div style={{ fontSize: 13 }}>Your AI career coach is ready once you provide a resume.</div>
        </div>
      )}

      {resumeText && messages.length === 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontWeight: 600 }}>
            <Sparkles size={16} color="#f6ad55" /> Suggested Questions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => send(s)}
                style={{ background: '#0f1117', border: '1px solid #2d3748', borderRadius: 8, padding: '10px 12px', color: '#a0aec0', fontSize: 12, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s, color 0.2s' }}
                onMouseEnter={e => { e.target.style.borderColor = '#667eea'; e.target.style.color = '#e2e8f0'; }}
                onMouseLeave={e => { e.target.style.borderColor = '#2d3748'; e.target.style.color = '#a0aec0'; }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 300, maxHeight: 480 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }} className="fade-in">
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.role === 'user' ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#2d3748', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {m.role === 'user' ? <User size={15} color="#fff" /> : <Bot size={15} color="#7f9cf5" />}
              </div>
              <div style={{
                maxWidth: '75%', padding: '10px 14px', borderRadius: m.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                background: m.role === 'user' ? 'linear-gradient(135deg, #667eea20, #764ba220)' : '#1a1d27',
                border: `1px solid ${m.role === 'user' ? '#667eea40' : '#2d3748'}`,
                fontSize: 14, lineHeight: 1.7, color: '#e2e8f0', whiteSpace: 'pre-wrap',
              }} className={m.streaming ? 'typing-cursor' : ''}>
                {m.content || (m.streaming ? '' : '...')}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {resumeText && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about your resume, career advice, interview tips..."
            disabled={loading}
          />
          <button className="btn-primary" onClick={() => send()} disabled={loading || !input.trim()} style={{ padding: '10px 16px', flexShrink: 0 }}>
            <Send size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
