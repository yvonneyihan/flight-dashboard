import React from 'react';

export default function ConfidenceGauge({ value }) {
  const clamped = Math.max(0, Math.min(100, value));
  const R = 78;
  const cx = 100;
  const cy = 108;
  const sw = 12;
  const color = clamped >= 85 ? 'var(--emerald)' : clamped >= 70 ? 'var(--primary)' : 'var(--amber)';

  const toXY = (deg) => {
    const r = (deg * Math.PI) / 180;
    return { x: cx + R * Math.cos(r), y: cy - R * Math.sin(r) };
  };

  const start = toXY(180);
  const end = toXY(0);
  const valAngle = 180 - (180 * clamped) / 100;
  const vp = toXY(valAngle);
  const bgPath = `M ${start.x} ${start.y} A ${R} ${R} 0 0 1 ${end.x} ${end.y}`;
  const valPath = clamped < 1 ? null : `M ${start.x} ${start.y} A ${R} ${R} 0 ${clamped > 50 ? 1 : 0} 1 ${vp.x} ${vp.y}`;

  const nRad = (valAngle * Math.PI) / 180;
  const nx = cx + 56 * Math.cos(nRad);
  const ny = cy - 56 * Math.sin(nRad);

  return (
    <svg viewBox="0 0 200 128" style={{ width: '100%', maxWidth: 220 }}>
      <path d={bgPath} fill="none" stroke="var(--muted)" strokeWidth={sw} strokeLinecap="round" />
      {valPath && <path d={valPath} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill={color} />
      <circle cx={cx} cy={cy} r={2} fill="var(--card)" />
      <text x={cx} y={cy - 28} fontSize="28" fontWeight="700" fill="var(--foreground)" textAnchor="middle" fontFamily="JetBrains Mono, monospace">{clamped}%</text>
      <text x={cx} y={cy - 10} fontSize="9" fill="var(--muted-foreground)" textAnchor="middle" fontWeight="600" letterSpacing="2">CONFIDENCE</text>
      <text x={start.x} y={cy + 18} fontSize="9" fill="var(--muted-foreground)" textAnchor="middle">0%</text>
      <text x={end.x} y={cy + 18} fontSize="9" fill="var(--muted-foreground)" textAnchor="middle">100%</text>
    </svg>
  );
}