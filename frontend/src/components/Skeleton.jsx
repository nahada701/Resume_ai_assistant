import React from 'react';

export default function Skeleton({ width = '100%', height = 16, borderRadius = 6, style = {} }) {
  return (
    <div className="skeleton" style={{ width, height, borderRadius, ...style }} />
  );
}

export function AnalyzeSkeleton({ isMobile }) {
  const gaugeSize = isMobile ? 80 : 110;
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <Skeleton height={20} width="40%" style={{ marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: isMobile ? 12 : 24, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          {[gaugeSize, gaugeSize, gaugeSize].map((s, i) => (
            <Skeleton key={i} width={s} height={s} borderRadius="50%" />
          ))}
        </div>
        <Skeleton height={14} style={{ marginBottom: 8 }} />
        <Skeleton height={14} width="80%" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        {[0, 1].map(i => (
          <div key={i} className="card">
            <Skeleton height={16} width="50%" style={{ marginBottom: 14 }} />
            {[0, 1, 2].map(j => <Skeleton key={j} height={12} style={{ marginBottom: 8 }} />)}
          </div>
        ))}
      </div>
      <div className="card">
        <Skeleton height={16} width="40%" style={{ marginBottom: 14 }} />
        {[0, 1, 2].map(i => <Skeleton key={i} height={12} style={{ marginBottom: 10 }} />)}
      </div>
    </div>
  );
}

export function JobMatchSkeleton({ isMobile }) {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <Skeleton width={isMobile ? 100 : 130} height={isMobile ? 100 : 130} borderRadius="50%" style={{ margin: '0 auto 12px' }} />
        <Skeleton height={20} width="40%" style={{ margin: '0 auto' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        {[0, 1].map(i => (
          <div key={i} className="card">
            <Skeleton height={16} width="50%" style={{ marginBottom: 12 }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[60, 80, 50, 70].map((w, j) => <Skeleton key={j} width={w} height={24} borderRadius={20} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
