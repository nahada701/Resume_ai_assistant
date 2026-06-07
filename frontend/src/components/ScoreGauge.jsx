import React from 'react';

function getColor(score) {
  if (score >= 80) return '#48bb78';
  if (score >= 60) return '#ed8936';
  return '#fc8181';
}

export default function ScoreGauge({ score, label, size = 100 }) {
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100) / 100;
  const dashOffset = circ * (1 - pct);
  const color = getColor(score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {/* Ring + number overlay */}
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2d3748" strokeWidth={8} />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={8}
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        {/* Score number — plain HTML, no SVG transform issues */}
        <div style={{
          position: 'relative', zIndex: 1,
          fontSize: Math.round(size * 0.22),
          fontWeight: 700,
          color,
          lineHeight: 1,
          fontFamily: 'Inter, -apple-system, sans-serif',
        }}>
          {score}
        </div>
      </div>
      {label && <div style={{ fontSize: 12, color: '#718096', fontWeight: 500 }}>{label}</div>}
    </div>
  );
}
