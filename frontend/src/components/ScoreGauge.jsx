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
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#2d3748" strokeWidth={8} />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
          style={{ fill: color, fontSize: size * 0.22, fontWeight: 700, fontFamily: 'Inter', transform: 'rotate(90deg)', transformOrigin: 'center' }}>
          {score}
        </text>
      </svg>
      {label && <div style={{ fontSize: 12, color: '#718096', fontWeight: 500 }}>{label}</div>}
    </div>
  );
}
