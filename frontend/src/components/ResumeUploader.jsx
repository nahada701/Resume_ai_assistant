import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle } from 'lucide-react';
import { api } from '../hooks/useStreamingText';

export default function ResumeUploader({ onResumeLoaded, resumeText, onParsed }) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleLoaded = async (text) => {
    onResumeLoaded(text);
    try {
      const { data } = await api.post('/parse-resume', { resume_text: text });
      if (onParsed) onParsed(data);
    } catch {}
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const form = new FormData();
    form.append('file', file);
    try {
      const { data } = await api.post('/upload-resume', form);
      setFileName(data.filename);
      await handleLoaded(data.text);
    } catch (e) {
      setError(e.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [onResumeLoaded, onParsed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] },
    maxFiles: 1,
  });

  return (
    <div>
      {resumeText ? (
        <div className="card fade-in" style={{ borderColor: '#4caf50', background: 'rgba(76,175,80,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle size={20} color="#4caf50" />
              <div>
                <div style={{ fontWeight: 600, color: '#68d391' }}>Resume loaded</div>
                {fileName && <div style={{ fontSize: 13, color: '#718096' }}>{fileName} · {resumeText.length.toLocaleString()} chars</div>}
                {!fileName && <div style={{ fontSize: 13, color: '#718096' }}>{resumeText.length.toLocaleString()} chars</div>}
              </div>
            </div>
            <button className="btn-secondary" onClick={() => { onResumeLoaded(''); setFileName(''); if (onParsed) onParsed(null); }} style={{ padding: '6px 12px' }}>
              <X size={14} /> Change
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div
            {...getRootProps()}
            className="card"
            style={{
              border: `2px dashed ${isDragActive ? '#667eea' : '#2d3748'}`,
              background: isDragActive ? 'rgba(102,126,234,0.05)' : '#1a1d27',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            <input {...getInputProps()} />
            <Upload size={40} color="#4a5568" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              {uploading ? 'Uploading...' : isDragActive ? 'Drop your resume here' : 'Upload your resume'}
            </div>
            <div style={{ color: '#718096', fontSize: 13 }}>PDF, DOCX, or TXT · Drag & drop or click to browse</div>
          </div>

          <div style={{ textAlign: 'center', color: '#4a5568', margin: '12px 0', fontSize: 13 }}>— or paste resume text —</div>

          <textarea
            className="input"
            placeholder="Paste your resume content here..."
            style={{ minHeight: 140 }}
            onChange={e => { if (e.target.value.length > 50) handleLoaded(e.target.value); }}
          />

          {error && <div style={{ color: '#fc8181', fontSize: 13, marginTop: 8 }}>{error}</div>}
        </div>
      )}
    </div>
  );
}
