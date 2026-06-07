import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

let _showToast = null;

export function showToast(message, type = 'success') {
  if (_showToast) _showToast(message, type);
}

const ICONS = { success: CheckCircle, error: XCircle, info: Info };
const COLORS = { success: '#48bb78', error: '#fc8181', info: '#7f9cf5' };

function ToastItem({ toast, onRemove }) {
  const Icon = ICONS[toast.type] || Info;
  const color = COLORS[toast.type] || COLORS.info;

  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 3000);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: '#1a1d27', border: `1px solid ${color}40`,
      borderLeft: `3px solid ${color}`, borderRadius: 8,
      padding: '10px 14px', minWidth: 240, maxWidth: 340,
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      animation: 'toastIn 0.25s ease',
    }}>
      <Icon size={16} color={color} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: '#e2e8f0', flex: 1 }}>{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#4a5568' }}>
        <X size={13} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => { _showToast = add; return () => { _showToast = null; }; }, [add]);

  if (!toasts.length) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={remove} />)}
    </div>
  );
}
