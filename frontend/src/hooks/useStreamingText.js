import { useState, useCallback } from 'react';
import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export function useStreamingText() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const stream = useCallback(async (endpoint, payload) => {
    setLoading(true);
    setText('');
    try {
      const response = await fetch(`${BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setText(prev => prev + decoder.decode(value));
      }
    } catch (e) {
      setText('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { text, loading, stream, setText };
}

export const api = axios.create({ baseURL: BASE });
