import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, keyframes } from '@mui/material';

// ═══════════════════════════════════════════════════════════════════════════════
// KEYFRAME ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════

const floatAnim = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const bounceAnim = keyframes`
  0%, 100% { transform: translateY(0px) scale(1); }
  25% { transform: translateY(-18px) scale(1.04); }
  50% { transform: translateY(0px) scale(0.96); }
  75% { transform: translateY(-9px) scale(1.02); }
`;

const wobbleAnim = keyframes`
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
`;

const pulseAnim = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.75; transform: scale(1.08); }
`;

const sleepAnim = keyframes`
  0%, 100% { transform: translateY(0px) rotate(-2deg); }
  50% { transform: translateY(3px) rotate(2deg); }
`;

const excitedAnim = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  12% { transform: translateY(-22px) rotate(-4deg); }
  24% { transform: translateY(-4px) rotate(4deg); }
  36% { transform: translateY(-18px) rotate(-3deg); }
  50% { transform: translateY(0) rotate(2deg); }
  62% { transform: translateY(-12px) rotate(-2deg); }
  75% { transform: translateY(0) rotate(1deg); }
  87% { transform: translateY(-6px) rotate(-1deg); }
  100% { transform: translateY(0) rotate(0deg); }
`;

const heartFloat = keyframes`
  0% { opacity: 1; transform: translateY(0) scale(0.5) rotate(0deg); }
  40% { opacity: 1; transform: translateY(-25px) scale(1.1) rotate(-8deg); }
  100% { opacity: 0; transform: translateY(-65px) scale(0.4) rotate(10deg); }
`;

const glowAnim = keyframes`
  0%, 100% { filter: drop-shadow(0 0 8px rgba(108,99,255,0.25)); }
  50% { filter: drop-shadow(0 0 22px rgba(108,99,255,0.65)); }
`;

const sparkleAnim = keyframes`
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
`;

const zzzAnim = keyframes`
  0% { opacity: 0; transform: translate(0, 0) scale(0.7); }
  40% { opacity: 1; transform: translate(12px, -18px) scale(1.2); }
  100% { opacity: 0; transform: translate(28px, -42px) scale(0.5); }
`;

const foodFloat = keyframes`
  0% { opacity: 1; transform: translateY(0) scale(0.6); }
  30% { opacity: 1; transform: translateY(-15px) scale(1.1); }
  100% { opacity: 0; transform: translateY(-55px) scale(0.3); }
`;

const starBurst = keyframes`
  0% { opacity: 1; transform: translate(0, 0) scale(0.5) rotate(0deg); }
  60% { opacity: 0.9; transform: translate(var(--tx), var(--ty)) scale(1.2) rotate(200deg); }
  100% { opacity: 0; transform: translate(calc(var(--tx) * 1.4), calc(var(--ty) * 1.4)) scale(0.3) rotate(360deg); }
`;

const happyBounce = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  20% { transform: translateY(-14px) scale(1.06); }
  40% { transform: translateY(0) scale(0.97); }
  60% { transform: translateY(-7px) scale(1.03); }
  80% { transform: translateY(0) scale(0.99); }
`;

const eatAnim = keyframes`
  0%, 100% { transform: rotate(0deg); }
  15% { transform: rotate(4deg) translateY(2px); }
  30% { transform: rotate(-2deg); }
  45% { transform: rotate(3deg) translateY(1px); }
  60% { transform: rotate(0deg); }
`;

const tailWag = keyframes`
  0%, 100% { transform: rotate(-12deg); }
  50% { transform: rotate(12deg); }
`;

const shimmerAnim = keyframes`
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.45; }
`;

const blushPop = keyframes`
  0% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 0.7; transform: scale(1.15); }
  100% { opacity: 0.55; transform: scale(1); }
`;

const goldenGlow = keyframes`
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.35; }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & EXPORTED CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const stageDescriptions = {
  1: 'Sou um ovinho! Alimenta-me para eu eclodir!',
  2: 'Olá! Acabei de nascer! Brinca comigo!',
  3: 'Estou a crescer! Quero ser forte!',
  4: 'Sou adulto agora! Obrigado por cuidares de mim!'
};

export const stageNames = { 1: 'Ovo', 2: 'Bebé', 3: 'Jovem', 4: 'Adulto' };

export const moodAnimations = {
  feliz: floatAnim,
  triste: sleepAnim,
  sonolento: sleepAnim,
  energico: excitedAnim,
  com_fome: wobbleAnim,
  brincalhao: bounceAnim,
  doente: wobbleAnim
};

export const speciesColors = {
  gato: {
    primary: '#FFB74D', secondary: '#FF9800', accent: '#FFF3E0',
    belly: '#FFF8E1', nose: '#F48FB1', inner: '#FFCCBC',
    iris: '#FF8F00'
  },
  cao: {
    primary: '#A1887F', secondary: '#8D6E63', accent: '#EFEBE9',
    belly: '#FFF8E1', nose: '#5D4037', inner: '#FFCCBC',
    iris: '#795548'
  },
  passaro: {
    primary: '#64B5F6', secondary: '#42A5F5', accent: '#E3F2FD',
    belly: '#FFF8E1', nose: '#FFB74D', inner: '#FFE082',
    iris: '#1E88E5'
  },
  tartaruga: {
    primary: '#81C784', secondary: '#66BB6A', accent: '#E8F5E9',
    belly: '#FFF8E1', nose: '#388E3C', inner: '#C8E6C9',
    iris: '#2E7D32'
  }
};

const sizeScales = { 1: 1.0, 2: 0.65, 3: 0.82, 4: 1.0 };

// ═══════════════════════════════════════════════════════════════════════════════
// SVG GRADIENTS GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

const GradientDefs = ({ species, id = 'pet' }) => {
  const c = speciesColors[species] || speciesColors.gato;
  return (
    <defs>
      {/* Body gradient - subtle top-left to bottom-right */}
      <linearGradient id={`${id}-body`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={c.primary} />
        <stop offset="100%" stopColor={c.secondary} />
      </linearGradient>
      {/* Head radial gradient - 3D sphere look */}
      <radialGradient id={`${id}-head`} cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor={c.primary} />
        <stop offset="100%" stopColor={c.secondary} />
      </radialGradient>
      {/* Belly radial gradient - lighter */}
      <radialGradient id={`${id}-belly`} cx="50%" cy="40%" r="55%">
        <stop offset="0%" stopColor={c.belly} />
        <stop offset="100%" stopColor={c.accent} />
      </radialGradient>
      {/* Shell gradient for turtle */}
      <radialGradient id={`${id}-shell`} cx="45%" cy="40%" r="55%">
        <stop offset="0%" stopColor={c.primary} />
        <stop offset="100%" stopColor={c.secondary} />
      </radialGradient>
      {/* Heart gradient */}
      <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#F48FB1" />
        <stop offset="100%" stopColor="#E91E63" />
      </linearGradient>
      {/* Egg gradient */}
      <radialGradient id={`${id}-egg`} cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor={c.primary} />
        <stop offset="100%" stopColor={c.secondary} />
      </radialGradient>
    </defs>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICLE EFFECT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const HeartSvgPath = ({ x, y, size, opacity }) => (
  <path
    d={`M${x},${y + size * 0.3} C${x},${y} ${x - size * 0.5},${y} ${x - size * 0.5},${y + size * 0.3} C${x - size * 0.5},${y + size * 0.6} ${x},${y + size * 0.8} ${x},${y + size} C${x},${y + size * 0.8} ${x + size * 0.5},${y + size * 0.6} ${x + size * 0.5},${y + size * 0.3} C${x + size * 0.5},${y} ${x},${y} ${x},${y + size * 0.3} Z`}
    fill="url(#heart-gradient)" opacity={opacity || 0.85}
  />
);

const FourPointStar = ({ cx, cy, r, fill, opacity }) => (
  <path
    d={`M${cx},${cy - r} L${cx + r * 0.3},${cy - r * 0.3} L${cx + r},${cy} L${cx + r * 0.3},${cy + r * 0.3} L${cx},${cy + r} L${cx - r * 0.3},${cy + r * 0.3} L${cx - r},${cy} L${cx - r * 0.3},${cy - r * 0.3} Z`}
    fill={fill || '#FFD700'} opacity={opacity || 0.9}
  />
);

const FoodParticles = ({ show }) => {
  if (!show) return null;
  const foods = ['🍖', '🥕', '🍎', '🐟', '🧀', '🍗'];
  const particles = [
    { left: '25%', delay: '0s', emoji: foods[0] },
    { left: '45%', delay: '0.2s', emoji: foods[1] },
    { left: '65%', delay: '0.1s', emoji: foods[2] },
    { left: '35%', delay: '0.35s', emoji: foods[3] },
    { left: '55%', delay: '0.25s', emoji: foods[4] },
    { left: '75%', delay: '0.15s', emoji: foods[5] }
  ];
  return (
    <Box sx={{ position: 'absolute', top: '15%', left: 0, right: 0, pointerEvents: 'none', zIndex: 10 }}>
      {particles.map((p, i) => (
        <Box key={i} sx={{
          position: 'absolute', left: p.left, fontSize: 18,
          animation: `${foodFloat} 1.2s ease-out ${p.delay} forwards`
        }}>
          {p.emoji}
        </Box>
      ))}
    </Box>
  );
};

const HeartParticles = ({ show }) => {
  if (!show) return null;
  const hearts = [
    { left: '28%', delay: '0s' }, { left: '50%', delay: '0.12s' },
    { left: '72%', delay: '0.24s' }, { left: '38%', delay: '0.36s' },
    { left: '62%', delay: '0.18s' }, { left: '20%', delay: '0.3s' },
    { left: '80%', delay: '0.08s' }
  ];
  return (
    <Box sx={{ position: 'absolute', top: '10%', left: 0, right: 0, height: '60%', pointerEvents: 'none', zIndex: 10 }}>
      {hearts.map((h, i) => (
        <Box key={i} sx={{
          position: 'absolute', left: h.left, top: '0%',
          animation: `${heartFloat} 1.1s ease-out ${h.delay} forwards`,
          filter: 'drop-shadow(0 0 4px rgba(233,30,99,0.5))'
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22">
            <defs>
              <linearGradient id={`hg-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F8BBD0" />
                <stop offset="100%" stopColor="#E91E63" />
              </linearGradient>
            </defs>
            <path d="M11,19 C11,19 2,12 2,7.5 C2,5 4,3 6.5,3 C8.1,3 9.5,3.8 11,5.5 C12.5,3.8 13.9,3 15.5,3 C18,3 20,5 20,7.5 C20,12 11,19 11,19 Z"
              fill={`url(#hg-${i})`} />
          </svg>
        </Box>
      ))}
    </Box>
  );
};

const StarBurstEffect = ({ show }) => {
  if (!show) return null;
  const directions = [
    { '--tx': '-35px', '--ty': '-30px', left: '45%', top: '25%', delay: '0s' },
    { '--tx': '30px', '--ty': '-35px', left: '55%', top: '25%', delay: '0.05s' },
    { '--tx': '-40px', '--ty': '10px', left: '30%', top: '45%', delay: '0.1s' },
    { '--tx': '40px', '--ty': '10px', left: '70%', top: '45%', delay: '0.08s' },
    { '--tx': '0px', '--ty': '-40px', left: '50%', top: '15%', delay: '0.12s' },
    { '--tx': '-25px', '--ty': '-20px', left: '35%', top: '30%', delay: '0.15s' },
    { '--tx': '25px', '--ty': '-20px', left: '65%', top: '30%', delay: '0.03s' },
    { '--tx': '35px', '--ty': '-25px', left: '60%', top: '20%', delay: '0.18s' }
  ];
  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {directions.map((d, i) => (
        <Box key={i} sx={{
          position: 'absolute', left: d.left, top: d.top,
          animation: `${starBurst} 0.9s ease-out ${d.delay} forwards`,
          '--tx': d['--tx'], '--ty': d['--ty']
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M9,1 L11.5,6.5 L17,9 L11.5,11.5 L9,17 L6.5,11.5 L1,9 L6.5,6.5 Z"
              fill="#FFD700" stroke="#FFA000" strokeWidth="0.5" />
          </svg>
        </Box>
      ))}
    </Box>
  );
};

const SparkleEffect = ({ show }) => {
  const sparkles = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    top: `${12 + ((i * 37) % 76)}%`,
    left: `${10 + ((i * 43) % 80)}%`,
    delay: `${(i * 0.18) % 0.9}s`,
    size: 8 + ((i * 3) % 6),
    color: i % 2 === 0 ? '#FFD700' : '#FFC107'
  })), []);
  if (!show) return null;
  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
      {sparkles.map((s, i) => (
        <Box key={i} sx={{
          position: 'absolute', top: s.top, left: s.left,
          animation: `${sparkleAnim} 1.2s ease-in-out ${s.delay} infinite`
        }}>
          <svg width={s.size} height={s.size} viewBox="0 0 16 16">
            <path d="M8,0 L10,6 L16,8 L10,10 L8,16 L6,10 L0,8 L6,6 Z"
              fill={s.color} opacity="0.85" />
          </svg>
        </Box>
      ))}
    </Box>
  );
};

const ZzzEffect = ({ show }) => {
  if (!show) return null;
  return (
    <Box sx={{ position: 'absolute', top: '5%', right: '8%', pointerEvents: 'none', zIndex: 10 }}>
      {[0, 1, 2].map(i => (
        <Typography key={i} sx={{
          position: 'absolute', top: i * 16, right: i * 12,
          fontSize: 12 + i * 5, fontWeight: 700, color: '#B39DDB',
          animation: `${zzzAnim} 2.2s ease-in-out ${i * 0.55}s infinite`,
          fontFamily: '"Comic Sans MS", cursive',
          opacity: 0.75,
          textShadow: '0 0 6px rgba(149,117,205,0.4)'
        }}>
          Z
        </Typography>
      ))}
    </Box>
  );
};

const BlushEffect = ({ show }) => {
  if (!show) return null;
  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 8 }}>
      <Box sx={{
        position: 'absolute', top: '36%', left: '18%', width: 36, height: 22,
        borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(244,143,177,0.6) 0%, rgba(244,143,177,0) 70%)',
        animation: `${blushPop} 0.5s ease-out forwards`
      }} />
      <Box sx={{
        position: 'absolute', top: '36%', right: '18%', width: 36, height: 22,
        borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(244,143,177,0.6) 0%, rgba(244,143,177,0) 70%)',
        animation: `${blushPop} 0.5s ease-out 0.1s forwards`
      }} />
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// KAWAII EYE COMPONENT (THE STAR OF THE SHOW)
// ═══════════════════════════════════════════════════════════════════════════════

const KawaiiEye = ({ cx, cy, r, closed, big, scl, irisColor, mood }) => {
  // Closed eyes: cute curved line (not straight)
  if (closed) {
    return (
      <path
        d={`M${cx - r},${cy} Q${cx},${cy - r * 0.6} ${cx + r},${cy}`}
        stroke="#555" strokeWidth={scl * 2.2} fill="none" strokeLinecap="round"
      />
    );
  }

  // Doente mood: spiral eyes
  if (mood === 'doente') {
    return (
      <g>
        <circle cx={cx} cy={cy} r={r * 0.8} fill="white" stroke="#999" strokeWidth={scl * 0.8} />
        <path d={`M${cx},${cy - r * 0.5} C${cx + r * 0.3},${cy - r * 0.3} ${cx - r * 0.2},${cy + r * 0.1} ${cx + r * 0.1},${cy + r * 0.4}`}
          stroke="#888" strokeWidth={scl * 1.5} fill="none" />
      </g>
    );
  }

  const eyeR = big ? r * 1.35 : r;
  const irisR = eyeR * 0.72;
  const pupilR = irisR * 0.55;
  const iris = irisColor || '#333';

  return (
    <g>
      {/* Eye outline - soft */}
      <circle cx={cx} cy={cy} r={eyeR} fill="white" stroke="#666" strokeWidth={scl * 1.0} />
      {/* Colored iris */}
      <circle cx={cx + scl * 0.8} cy={cy + scl * 0.5} r={irisR} fill={iris} />
      {/* Iris inner glow */}
      <circle cx={cx + scl * 0.8} cy={cy + scl * 0.5} r={irisR * 0.7} fill={iris} opacity="0.8" />
      {/* Dark pupil */}
      <circle cx={cx + scl * 1.0} cy={cy + scl * 0.7} r={pupilR} fill="#222" />
      {/* Big highlight spot (top-left) */}
      <circle cx={cx - scl * 1.8} cy={cy - scl * 1.8} r={eyeR * 0.28} fill="white" opacity="0.95" />
      {/* Second smaller highlight (bottom-right) */}
      <circle cx={cx + scl * 2.0} cy={cy + scl * 1.5} r={eyeR * 0.14} fill="white" opacity="0.7" />
      {/* Subtle eyelash line on top */}
      <path
        d={`M${cx - eyeR * 0.9},${cy - eyeR * 0.75} Q${cx},${cy - eyeR * 1.15} ${cx + eyeR * 0.9},${cy - eyeR * 0.75}`}
        stroke="#555" strokeWidth={scl * 1.2} fill="none" strokeLinecap="round"
      />
    </g>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ORNATE CROWN (Adult Stage 4)
// ═══════════════════════════════════════════════════════════════════════════════

const Crown = ({ x, y, scl }) => (
  <g transform={`translate(${x}, ${y}) scale(${scl})`}>
    {/* Main crown body */}
    <path d="M2,20 L2,8 L8,14 L15,2 L22,14 L28,8 L28,20 Z"
      fill="#FFD700" stroke="#DAA520" strokeWidth="1.5" />
    {/* Crown band */}
    <rect x="2" y="17" width="26" height="5" rx="1" fill="#FFA000" />
    {/* Gemstones */}
    <circle cx="8" cy="12" r="3" fill="#E91E63" stroke="#AD1457" strokeWidth="0.5" />
    <circle cx="8" cy="12" r="1.2" fill="#F8BBD0" opacity="0.7" />
    <circle cx="15" cy="7" r="3.5" fill="#2196F3" stroke="#0D47A1" strokeWidth="0.5" />
    <circle cx="15" cy="7" r="1.5" fill="#BBDEFB" opacity="0.7" />
    <circle cx="22" cy="12" r="3" fill="#4CAF50" stroke="#1B5E20" strokeWidth="0.5" />
    <circle cx="22" cy="12" r="1.2" fill="#C8E6C9" opacity="0.7" />
    {/* Center gem on band */}
    <circle cx="15" cy="19.5" r="2.5" fill="#FF9800" stroke="#E65100" strokeWidth="0.5" />
    <circle cx="15" cy="19.5" r="1" fill="#FFE0B2" opacity="0.8" />
    {/* Top golden orb */}
    <line x1="15" y1="2" x2="15" y2="-4" stroke="#FFD700" strokeWidth="2" />
    <circle cx="15" cy="-6" r="3" fill="#FFD700" stroke="#DAA520" strokeWidth="1" />
    <circle cx="14" cy="-7" r="1" fill="white" opacity="0.6" />
    {/* Side orbs */}
    <circle cx="5" cy="6" r="1.8" fill="#FFD700" stroke="#DAA520" strokeWidth="0.5" />
    <circle cx="25" cy="6" r="1.8" fill="#FFD700" stroke="#DAA520" strokeWidth="0.5" />
  </g>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SHADOW & GLOW HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const SoftShadow = ({ cx, cy, rx, ry }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
    fill="rgba(0,0,0,0.08)" filter="url(#shadow-blur)" />
);

const ShadowFilter = () => (
  <defs>
    <filter id="shadow-blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
    </filter>
  </defs>
);

const GoldenAura = ({ cx, cy, rx, ry }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
    fill="none" stroke="rgba(255,215,0,0.25)" strokeWidth="4"
    style={{ animation: `${goldenGlow} 2.5s ease-in-out infinite` }} />
);

// ═══════════════════════════════════════════════════════════════════════════════
// MOOD-SPECIFIC FEATURE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const MoodFeatures = ({ mood, headCy, headR, scl, species }) => {
  const c = speciesColors[species] || speciesColors.gato;
  const hx = 70; // center x of head in viewBox

  return (
    <g>
      {/* Triste: gray overlay + teardrop */}
      {mood === 'triste' && (
        <g>
          <circle cx={hx} cy={headCy} r={headR} fill="rgba(100,100,100,0.12)" />
          <path d={`M${hx + headR * 0.45},${headCy + headR * 0.15} Q${hx + headR * 0.55},${headCy + headR * 0.5} ${hx + headR * 0.4},${headCy + headR * 0.6}`}
            fill="#90CAF9" opacity="0.6" />
        </g>
      )}
      {/* Doente: green tint + band-aid */}
      {mood === 'doente' && (
        <g>
          <circle cx={hx} cy={headCy} r={headR} fill="rgba(100,180,100,0.1)" />
          <rect x={hx - 4 * scl} y={headCy - headR * 0.3} width={8 * scl} height={5 * scl} rx={2 * scl}
            fill="#FFECB3" stroke="#FFB74D" strokeWidth={scl * 0.5} opacity="0.8" />
          <circle cx={hx - 1 * scl} cy={headCy - headR * 0.3 + 2.5 * scl} r={0.8 * scl} fill="#D7CCC8" />
          <circle cx={hx + 1 * scl} cy={headCy - headR * 0.3 + 2.5 * scl} r={0.8 * scl} fill="#D7CCC8" />
        </g>
      )}
      {/* Energico: motion lines */}
      {mood === 'energico' && (
        <g opacity="0.4">
          <line x1={hx - headR * 1.3} y1={headCy - headR * 0.5} x2={hx - headR * 0.9} y2={headCy - headR * 0.5}
            stroke={c.secondary} strokeWidth={scl * 2} strokeLinecap="round" />
          <line x1={hx - headR * 1.4} y1={headCy} x2={hx - headR * 0.95} y2={headCy}
            stroke={c.secondary} strokeWidth={scl * 1.8} strokeLinecap="round" />
          <line x1={hx - headR * 1.3} y1={headCy + headR * 0.5} x2={hx - headR * 0.9} y2={headCy + headR * 0.5}
            stroke={c.secondary} strokeWidth={scl * 1.5} strokeLinecap="round" />
          <line x1={hx + headR * 1.3} y1={headCy - headR * 0.3} x2={hx + headR * 0.9} y2={headCy - headR * 0.3}
            stroke={c.secondary} strokeWidth={scl * 1.8} strokeLinecap="round" />
          <line x1={hx + headR * 1.35} y1={headCy + headR * 0.2} x2={hx + headR * 0.95} y2={headCy + headR * 0.2}
            stroke={c.secondary} strokeWidth={scl * 1.5} strokeLinecap="round" />
        </g>
      )}
      {/* Com_fome: sweat drop */}
      {mood === 'com_fome' && (
        <path d={`M${hx + headR * 0.5},${headCy - headR * 0.4} Q${hx + headR * 0.6},${headCy - headR * 0.1} ${hx + headR * 0.5},${headCy + headR * 0.05} Q${hx + headR * 0.35},${headCy - headR * 0.15} ${hx + headR * 0.5},${headCy - headR * 0.4} Z`}
          fill="#90CAF9" opacity="0.6" />
      )}
    </g>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// EGG SVG (Stage 1)
// ═══════════════════════════════════════════════════════════════════════════════

const EggSVG = ({ species, mood, size, interaction }) => {
  const colors = speciesColors[species] || speciesColors.gato;
  const baseAnim = mood === 'energico' ? bounceAnim : moodAnimations[mood] || wobbleAnim;
  const isEating = interaction === 'feed';
  const anim = isEating ? eatAnim : baseAnim;
  const iris = colors.iris || '#333';

  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 120 150"
      style={{ animation: `${anim} 3s ease-in-out infinite` }}>
      <ShadowFilter />
      <GradientDefs species={species} id="egg" />

      {/* Soft shadow */}
      <SoftShadow cx="60" cy="142" rx="34" ry="8" />

      {/* Egg body with gradient */}
      <ellipse cx="60" cy="72" rx="46" ry="58" fill="url(#egg-egg)" />
      {/* Highlight shimmer */}
      <ellipse cx="50" cy="50" rx="18" ry="28" fill="white" opacity="0.18"
        style={{ animation: `${shimmerAnim} 2.5s ease-in-out infinite` }} />
      <ellipse cx="48" cy="44" rx="8" ry="14" fill="white" opacity="0.12" />

      {/* Speckles */}
      <circle cx="38" cy="42" r="4.5" fill={colors.secondary} opacity="0.3" />
      <circle cx="78" cy="50" r="3.5" fill={colors.secondary} opacity="0.25" />
      <circle cx="50" cy="88" r="4" fill={colors.secondary} opacity="0.25" />
      <circle cx="72" cy="78" r="3" fill={colors.secondary} opacity="0.3" />
      <circle cx="44" cy="65" r="2.5" fill={colors.secondary} opacity="0.2" />

      {/* Crack for energico */}
      {mood === 'energico' && (
        <g>
          <path d="M54 22 L57 38 L49 48 L58 56 L54 65" stroke={colors.secondary} strokeWidth="2.5" fill="none" opacity="0.7" />
          <path d="M57 38 L67 33" stroke={colors.secondary} strokeWidth="1.8" fill="none" opacity="0.6" />
        </g>
      )}

      {/* Face */}
      {mood === 'sonolento' ? (
        <g>
          <path d="M47,62 Q51,59 56,62" stroke="#555" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M66,62 Q70,59 75,62" stroke="#555" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M56,76 Q61,73 66,76" stroke="#555" strokeWidth="1.5" fill="none" />
        </g>
      ) : (
        <g>
          <KawaiiEye cx={51} cy={60} r={5.5} closed={false} big={mood === 'energico'} scl={0.9} irisColor={iris} mood={mood} />
          <KawaiiEye cx={70} cy={60} r={5.5} closed={false} big={mood === 'energico'} scl={0.9} irisColor={iris} mood={mood} />
          {mood === 'feliz' && <path d="M55 73 Q61 79 67 73" stroke="#555" strokeWidth="1.8" fill="none" />}
          {mood === 'com_fome' && <ellipse cx="61" cy="75" rx="4" ry="3.5" fill="#777" />}
          {mood === 'triste' && <path d="M55 78 Q61 72 67 78" stroke="#555" strokeWidth="1.8" fill="none" />}
          {mood === 'brincalhao' && <circle cx="61" cy="75" r="2.5" fill="#777" />}
          {mood === 'doente' && <path d="M55 77 Q61 81 67 77" stroke="#555" strokeWidth="1.5" fill="none" strokeDasharray="2 2" />}
        </g>
      )}

      {/* Blush */}
      <ellipse cx="43" cy="70" rx="6" ry="3.5" fill="#F8BBD0" opacity="0.45" />
      <ellipse cx="78" cy="70" rx="6" ry="3.5" fill="#F8BBD0" opacity="0.45" />
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CAT SVG (Stages 2-4)
// ═══════════════════════════════════════════════════════════════════════════════

const CatSVG = ({ species, mood, stage, size, interaction }) => {
  const colors = speciesColors[species] || speciesColors.gato;
  const scl = sizeScales[stage] || 1;
  const isEating = interaction === 'feed';
  const isPetting = interaction === 'pet';
  const isPlaying = interaction === 'play';
  const anim = isPlaying ? excitedAnim : isEating ? eatAnim : moodAnimations[mood] || floatAnim;
  const isChibi = stage === 2;
  const isAdult = stage === 4;
  const iris = colors.iris || '#FF8F00';

  // Proportions: Baby head 70%, Young 50%, Adult 40%
  const headR = isChibi ? 36 : isAdult ? 30 : 32;
  const bodyRx = isChibi ? 22 : isAdult ? 30 : 27;
  const bodyRy = isChibi ? 18 : isAdult ? 36 : 28;
  const bodyCy = isChibi ? 104 : 108;
  const headCy = isChibi ? 50 : 56;
  const eyeR = isChibi ? 8 : isAdult ? 7 : 7.5;
  const earH = isChibi ? 24 : isAdult ? 20 : 22;

  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 140 160"
      style={{ animation: `${anim} ${isPlaying ? '1s' : '2.5s'} ease-in-out infinite` }}>
      <ShadowFilter />
      <GradientDefs species={species} id="cat" />

      {/* Soft shadow */}
      <SoftShadow cx="70" cy="152" rx={bodyRx * scl + 6} ry="6" />

      {/* Golden aura for adult */}
      {isAdult && <GoldenAura cx="70" cy={(headCy + bodyCy) / 2} rx={bodyRx * scl + 14} ry={(bodyRy + headR) * scl / 2 + 14} />}

      {/* Tail - long curved */}
      <path
        d={`M${70 + bodyRx * scl * 0.9},${bodyCy - bodyRy * scl * 0.3} Q${70 + bodyRx * scl * 1.6},${bodyCy - bodyRy * scl * 1.2} ${70 + bodyRx * scl * 1.4},${bodyCy - bodyRy * scl * 1.7} Q${70 + bodyRx * scl * 1.2},${bodyCy - bodyRy * scl * 2.0} ${70 + bodyRx * scl * 1.3},${bodyCy - bodyRy * scl * 2.2}`}
        stroke={colors.secondary} strokeWidth={scl * (isChibi ? 5 : 7)} fill="none" strokeLinecap="round"
        style={{ transformOrigin: `${70 + bodyRx * scl * 0.9}px ${bodyCy - bodyRy * scl * 0.3}px` }}
      />
      <path
        d={`M${70 + bodyRx * scl * 0.9},${bodyCy - bodyRy * scl * 0.3} Q${70 + bodyRx * scl * 1.6},${bodyCy - bodyRy * scl * 1.2} ${70 + bodyRx * scl * 1.4},${bodyCy - bodyRy * scl * 1.7}`}
        stroke={colors.primary} strokeWidth={scl * (isChibi ? 3 : 4)} fill="none" strokeLinecap="round"
      />

      {/* Body */}
      <ellipse cx="70" cy={bodyCy} rx={bodyRx * scl} ry={bodyRy * scl} fill="url(#cat-body)" />
      {/* Belly */}
      <ellipse cx="70" cy={bodyCy + 3} rx={(bodyRx - 7) * scl} ry={(bodyRy - 5) * scl} fill="url(#cat-belly)" />

      {/* Paws */}
      <ellipse cx={70 - bodyRx * scl * 0.42} cy={bodyCy + bodyRy * scl - 2} rx={isChibi ? 8 * scl : 7 * scl} ry={4 * scl} fill={colors.secondary} />
      <ellipse cx={70 + bodyRx * scl * 0.42} cy={bodyCy + bodyRy * scl - 2} rx={isChibi ? 8 * scl : 7 * scl} ry={4 * scl} fill={colors.secondary} />
      {/* Paw pads */}
      <ellipse cx={70 - bodyRx * scl * 0.42} cy={bodyCy + bodyRy * scl} rx={3 * scl} ry={2 * scl} fill={colors.inner} />
      <ellipse cx={70 + bodyRx * scl * 0.42} cy={bodyCy + bodyRy * scl} rx={3 * scl} ry={2 * scl} fill={colors.inner} />

      {/* Head with radial gradient */}
      <circle cx="70" cy={headCy} r={headR * scl} fill="url(#cat-head)" />
      {/* Head highlight */}
      <circle cx={64} cy={headCy - headR * scl * 0.2} r={headR * scl * 0.35} fill="white" opacity="0.12" />

      {/* Pointed ears with pink inner */}
      <polygon
        points={`${70 - headR * 0.72 * scl},${headCy - headR * 0.55 * scl} ${70 - headR * 0.88 * scl},${headCy - headR * 0.55 * scl - earH * scl} ${70 - headR * 0.22 * scl},${headCy - headR * 0.78 * scl}`}
        fill={colors.primary} />
      <polygon
        points={`${70 + headR * 0.72 * scl},${headCy - headR * 0.55 * scl} ${70 + headR * 0.88 * scl},${headCy - headR * 0.55 * scl - earH * scl} ${70 + headR * 0.22 * scl},${headCy - headR * 0.78 * scl}`}
        fill={colors.primary} />
      {/* Inner ears - pink */}
      <polygon
        points={`${70 - headR * 0.65 * scl},${headCy - headR * 0.52 * scl} ${70 - headR * 0.8 * scl},${headCy - headR * 0.55 * scl - (earH - 5) * scl} ${70 - headR * 0.32 * scl},${headCy - headR * 0.73 * scl}`}
        fill="#F8BBD0" />
      <polygon
        points={`${70 + headR * 0.65 * scl},${headCy - headR * 0.52 * scl} ${70 + headR * 0.8 * scl},${headCy - headR * 0.55 * scl - (earH - 5) * scl} ${70 + headR * 0.32 * scl},${headCy - headR * 0.73 * scl}`}
        fill="#F8BBD0" />

      {/* Mood features */}
      <MoodFeatures mood={mood} headCy={headCy} headR={headR * scl} scl={scl} species={species} />

      {/* Eyes */}
      {mood === 'sonolento' ? (
        <g>
          <path d={`M${70 - headR * 0.45 * scl},${headCy - 2 * scl} Q${70 - headR * 0.22 * scl},${headCy - 5 * scl} ${70 - headR * 0.05 * scl},${headCy - 2 * scl}`}
            stroke="#555" strokeWidth={scl * 2.2} fill="none" strokeLinecap="round" />
          <path d={`M${70 + headR * 0.05 * scl},${headCy - 2 * scl} Q${70 + headR * 0.22 * scl},${headCy - 5 * scl} ${70 + headR * 0.45 * scl},${headCy - 2 * scl}`}
            stroke="#555" strokeWidth={scl * 2.2} fill="none" strokeLinecap="round" />
        </g>
      ) : mood === 'brincalhao' ? (
        <g>
          <KawaiiEye cx={70 - headR * 0.25 * scl} cy={headCy - 2 * scl} r={eyeR * scl} closed={false} big={false} scl={scl} irisColor={iris} mood={mood} />
          <path d={`M${70 + headR * 0.05 * scl},${headCy - 2 * scl} Q${70 + headR * 0.25 * scl},${headCy - 5 * scl} ${70 + headR * 0.45 * scl},${headCy - 2 * scl}`}
            stroke="#555" strokeWidth={scl * 2.2} fill="none" strokeLinecap="round" />
          {/* Tongue out */}
          <ellipse cx={70 + headR * 0.2 * scl} cy={headCy + headR * 0.38 * scl} rx={3 * scl} ry={4 * scl} fill="#F48FB1" />
        </g>
      ) : (
        <g>
          <KawaiiEye cx={70 - headR * 0.25 * scl} cy={headCy - 2 * scl} r={eyeR * scl} closed={false} big={mood === 'energico'} scl={scl} irisColor={iris} mood={mood} />
          <KawaiiEye cx={70 + headR * 0.25 * scl} cy={headCy - 2 * scl} r={eyeR * scl} closed={false} big={mood === 'energico'} scl={scl} irisColor={iris} mood={mood} />
        </g>
      )}

      {/* Nose */}
      <path d={`M${70 - 1.8 * scl},${headCy + headR * 0.14 * scl} L70,${headCy + headR * 0.22 * scl} L${70 + 1.8 * scl},${headCy + headR * 0.14 * scl} Z`}
        fill={colors.nose} />

      {/* Mouth */}
      {mood === 'triste' ? (
        <path d={`M${70 - headR * 0.2 * scl},${headCy + headR * 0.35 * scl} Q70,${headCy + headR * 0.25 * scl} ${70 + headR * 0.2 * scl},${headCy + headR * 0.35 * scl}`}
          stroke="#555" strokeWidth={scl * 1.3} fill="none" />
      ) : mood === 'com_fome' ? (
        <ellipse cx="70" cy={headCy + headR * 0.32 * scl} rx={4 * scl} ry={3.5 * scl} fill="#888" />
      ) : (
        <path d={`M${70 - headR * 0.16 * scl},${headCy + headR * 0.26 * scl} Q${70 - headR * 0.06 * scl},${headCy + headR * 0.38 * scl} 70,${headCy + headR * 0.3 * scl} Q${70 + headR * 0.06 * scl},${headCy + headR * 0.38 * scl} ${70 + headR * 0.16 * scl},${headCy + headR * 0.26 * scl}`}
          stroke="#555" strokeWidth={scl * 1.3} fill="none" />
      )}

      {/* 3 whiskers per side */}
      <line x1={70 - headR * 0.95 * scl} y1={headCy + headR * 0.05 * scl} x2={70 - headR * 0.42 * scl} y2={headCy + headR * 0.1 * scl}
        stroke="#aaa" strokeWidth={scl * 0.8} />
      <line x1={70 - headR * scl} y1={headCy + headR * 0.18 * scl} x2={70 - headR * 0.4 * scl} y2={headCy + headR * 0.2 * scl}
        stroke="#aaa" strokeWidth={scl * 0.8} />
      <line x1={70 - headR * 0.95 * scl} y1={headCy + headR * 0.3 * scl} x2={70 - headR * 0.42 * scl} y2={headCy + headR * 0.3 * scl}
        stroke="#aaa" strokeWidth={scl * 0.7} />
      <line x1={70 + headR * 0.42 * scl} y1={headCy + headR * 0.1 * scl} x2={70 + headR * 0.95 * scl} y2={headCy + headR * 0.05 * scl}
        stroke="#aaa" strokeWidth={scl * 0.8} />
      <line x1={70 + headR * 0.4 * scl} y1={headCy + headR * 0.2 * scl} x2={70 + headR * scl} y2={headCy + headR * 0.18 * scl}
        stroke="#aaa" strokeWidth={scl * 0.8} />
      <line x1={70 + headR * 0.42 * scl} y1={headCy + headR * 0.3 * scl} x2={70 + headR * 0.95 * scl} y2={headCy + headR * 0.3 * scl}
        stroke="#aaa" strokeWidth={scl * 0.7} />

      {/* Rosy cheeks */}
      <ellipse cx={70 - headR * 0.52 * scl} cy={headCy + headR * 0.16 * scl} rx={6.5 * scl} ry={4 * scl}
        fill="#F8BBD0" opacity={isPetting ? 0.8 : 0.55} />
      <ellipse cx={70 + headR * 0.52 * scl} cy={headCy + headR * 0.16 * scl} rx={6.5 * scl} ry={4 * scl}
        fill="#F8BBD0" opacity={isPetting ? 0.8 : 0.55} />

      {/* Crown for adult */}
      {stage === 4 && <Crown x={55} y={headCy - headR * scl * 0.6 - earH * scl - 18} scl={0.85} />}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// DOG SVG (Stages 2-4)
// ═══════════════════════════════════════════════════════════════════════════════

const DogSVG = ({ species, mood, stage, size, interaction }) => {
  const colors = speciesColors[species] || speciesColors.cao;
  const scl = sizeScales[stage] || 1;
  const isEating = interaction === 'feed';
  const isPetting = interaction === 'pet';
  const isPlaying = interaction === 'play';
  const anim = isPlaying ? excitedAnim : isEating ? eatAnim : moodAnimations[mood] || floatAnim;
  const isChibi = stage === 2;
  const isAdult = stage === 4;
  const iris = colors.iris || '#795548';

  const headR = isChibi ? 36 : isAdult ? 31 : 33;
  const bodyRx = isChibi ? 24 : isAdult ? 32 : 28;
  const bodyRy = isChibi ? 20 : isAdult ? 38 : 29;
  const bodyCy = isChibi ? 104 : 108;
  const headCy = isChibi ? 50 : 56;
  const eyeR = isChibi ? 8.5 : isAdult ? 7 : 7.5;
  const isWagging = mood === 'feliz' || mood === 'brincalhao' || isPlaying;

  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 140 160"
      style={{ animation: `${anim} ${isPlaying ? '1s' : '2.5s'} ease-in-out infinite` }}>
      <ShadowFilter />
      <GradientDefs species={species} id="dog" />

      <SoftShadow cx="70" cy="152" rx={bodyRx * scl + 8} ry="6" />

      {isAdult && <GoldenAura cx="70" cy={(headCy + bodyCy) / 2} rx={bodyRx * scl + 14} ry={(bodyRy + headR) * scl / 2 + 14} />}

      {/* Fluffy wagging tail */}
      <g style={{ transformOrigin: `${70 + bodyRx * scl * 0.85}px ${bodyCy - bodyRy * scl * 0.45}px`, animation: isWagging ? `${tailWag} 0.35s ease-in-out infinite` : 'none' }}>
        <path
          d={`M${70 + bodyRx * scl * 0.85},${bodyCy - bodyRy * scl * 0.45} Q${70 + bodyRx * scl * 1.5},${bodyCy - bodyRy * scl * 1.4} ${70 + bodyRx * scl * 1.3},${bodyCy - bodyRy * scl * 1.8}`}
          stroke={colors.secondary} strokeWidth={scl * (isChibi ? 7 : 10)} fill="none" strokeLinecap="round" />
        <path
          d={`M${70 + bodyRx * scl * 0.85},${bodyCy - bodyRy * scl * 0.45} Q${70 + bodyRx * scl * 1.5},${bodyCy - bodyRy * scl * 1.4} ${70 + bodyRx * scl * 1.3},${bodyCy - bodyRy * scl * 1.8}`}
          stroke={colors.primary} strokeWidth={scl * (isChibi ? 4 : 6)} fill="none" strokeLinecap="round" />
      </g>

      {/* Body */}
      <ellipse cx="70" cy={bodyCy} rx={bodyRx * scl} ry={bodyRy * scl} fill="url(#dog-body)" />
      <ellipse cx="70" cy={bodyCy + 4} rx={(bodyRx - 8) * scl} ry={(bodyRy - 7) * scl} fill="url(#dog-belly)" />

      {/* Paws */}
      <ellipse cx={70 - bodyRx * scl * 0.38} cy={bodyCy + bodyRy * scl} rx={isChibi ? 9 * scl : 8 * scl} ry={5 * scl} fill={colors.secondary} />
      <ellipse cx={70 + bodyRx * scl * 0.38} cy={bodyCy + bodyRy * scl} rx={isChibi ? 9 * scl : 8 * scl} ry={5 * scl} fill={colors.secondary} />

      {/* Floppy ears with pink inner */}
      {isAdult ? (
        <>
          <ellipse cx={70 - headR * 0.78 * scl} cy={headCy - headR * 0.42 * scl} rx={11 * scl} ry={20 * scl}
            fill={colors.secondary} transform={`rotate(-15, ${70 - headR * 0.78 * scl}, ${headCy - headR * 0.42 * scl})`} />
          <ellipse cx={70 + headR * 0.78 * scl} cy={headCy - headR * 0.42 * scl} rx={11 * scl} ry={20 * scl}
            fill={colors.secondary} transform={`rotate(15, ${70 + headR * 0.78 * scl}, ${headCy - headR * 0.42 * scl})`} />
          <ellipse cx={70 - headR * 0.74 * scl} cy={headCy - headR * 0.38 * scl} rx={7 * scl} ry={13 * scl}
            fill="#F8BBD0" transform={`rotate(-15, ${70 - headR * 0.74 * scl}, ${headCy - headR * 0.38 * scl})`} />
          <ellipse cx={70 + headR * 0.74 * scl} cy={headCy - headR * 0.38 * scl} rx={7 * scl} ry={13 * scl}
            fill="#F8BBD0" transform={`rotate(15, ${70 + headR * 0.74 * scl}, ${headCy - headR * 0.38 * scl})`} />
        </>
      ) : (
        <>
          <ellipse cx={70 - headR * 0.85 * scl} cy={headCy + 4 * scl} rx={12 * scl} ry={22 * scl}
            fill={colors.secondary} transform={`rotate(20, ${70 - headR * 0.85 * scl}, ${headCy + 4 * scl})`} />
          <ellipse cx={70 + headR * 0.85 * scl} cy={headCy + 4 * scl} rx={12 * scl} ry={22 * scl}
            fill={colors.secondary} transform={`rotate(-20, ${70 + headR * 0.85 * scl}, ${headCy + 4 * scl})`} />
          <ellipse cx={70 - headR * 0.8 * scl} cy={headCy + 6 * scl} rx={7 * scl} ry={15 * scl}
            fill="#F8BBD0" transform={`rotate(20, ${70 - headR * 0.8 * scl}, ${headCy + 6 * scl})`} />
          <ellipse cx={70 + headR * 0.8 * scl} cy={headCy + 6 * scl} rx={7 * scl} ry={15 * scl}
            fill="#F8BBD0" transform={`rotate(-20, ${70 + headR * 0.8 * scl}, ${headCy + 6 * scl})`} />
        </>
      )}

      {/* Head */}
      <circle cx="70" cy={headCy} r={headR * scl} fill="url(#dog-head)" />
      <circle cx={65} cy={headCy - headR * scl * 0.18} r={headR * scl * 0.35} fill="white" opacity="0.1" />

      {/* Mood features */}
      <MoodFeatures mood={mood} headCy={headCy} headR={headR * scl} scl={scl} species={species} />

      {/* Eyes */}
      {mood === 'sonolento' ? (
        <g>
          <path d={`M${70 - headR * 0.38 * scl},${headCy - 3 * scl} Q${70 - headR * 0.2 * scl},${headCy - 6 * scl} ${70 - headR * 0.05 * scl},${headCy - 3 * scl}`}
            stroke="#555" strokeWidth={scl * 2.2} fill="none" strokeLinecap="round" />
          <path d={`M${70 + headR * 0.05 * scl},${headCy - 3 * scl} Q${70 + headR * 0.2 * scl},${headCy - 6 * scl} ${70 + headR * 0.38 * scl},${headCy - 3 * scl}`}
            stroke="#555" strokeWidth={scl * 2.2} fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <KawaiiEye cx={70 - headR * 0.24 * scl} cy={headCy - 3 * scl} r={eyeR * scl} closed={false} big={mood === 'energico'} scl={scl} irisColor={iris} mood={mood} />
          <KawaiiEye cx={70 + headR * 0.24 * scl} cy={headCy - 3 * scl} r={eyeR * scl} closed={false} big={mood === 'energico'} scl={scl} irisColor={iris} mood={mood} />
        </g>
      )}

      {/* Eyebrows for doente */}
      {mood === 'doente' && (
        <g>
          <line x1={70 - headR * 0.36 * scl} y1={headCy - headR * 0.35 * scl} x2={70 - headR * 0.14 * scl} y2={headCy - headR * 0.3 * scl}
            stroke="#666" strokeWidth={scl * 1.5} strokeLinecap="round" />
          <line x1={70 + headR * 0.14 * scl} y1={headCy - headR * 0.3 * scl} x2={70 + headR * 0.36 * scl} y2={headCy - headR * 0.35 * scl}
            stroke="#666" strokeWidth={scl * 1.5} strokeLinecap="round" />
        </g>
      )}

      {/* Big round nose */}
      <ellipse cx="70" cy={headCy + headR * 0.12 * scl} rx={5 * scl} ry={3.8 * scl} fill={colors.nose} />
      <ellipse cx="69" cy={headCy + headR * 0.08 * scl} rx={1.5 * scl} ry={1} fill="white" opacity="0.35" />

      {/* Mouth & Tongue (tongue out when happy) */}
      {mood === 'triste' ? (
        <path d={`M${70 - headR * 0.14 * scl},${headCy + headR * 0.3 * scl} Q70,${headCy + headR * 0.22 * scl} ${70 + headR * 0.14 * scl},${headCy + headR * 0.3 * scl}`}
          stroke="#555" strokeWidth={scl * 1.3} fill="none" />
      ) : mood === 'com_fome' ? (
        <g>
          <ellipse cx="70" cy={headCy + headR * 0.28 * scl} rx={4.5 * scl} ry={5 * scl} fill="#888" />
          <ellipse cx="70" cy={headCy + headR * 0.36 * scl} rx={3.5 * scl} ry={4 * scl} fill="#F48FB1" />
        </g>
      ) : (
        <g>
          <path d={`M${70 - headR * 0.14 * scl},${headCy + headR * 0.18 * scl} Q70,${headCy + headR * 0.28 * scl} ${70 + headR * 0.14 * scl},${headCy + headR * 0.18 * scl}`}
            stroke="#555" strokeWidth={scl * 1.3} fill="none" />
          {(mood === 'feliz' || mood === 'brincalhao' || mood === 'energico' || isPlaying) && (
            <ellipse cx="70" cy={headCy + headR * 0.34 * scl} rx={4 * scl} ry={5.5 * scl} fill="#F48FB1" />
          )}
        </g>
      )}

      {/* Big rosy cheeks */}
      <ellipse cx={70 - headR * 0.48 * scl} cy={headCy + headR * 0.18 * scl} rx={7 * scl} ry={4.5 * scl}
        fill="#F8BBD0" opacity={isPetting ? 0.85 : 0.6} />
      <ellipse cx={70 + headR * 0.48 * scl} cy={headCy + headR * 0.18 * scl} rx={7 * scl} ry={4.5 * scl}
        fill="#F8BBD0" opacity={isPetting ? 0.85 : 0.6} />

      {/* Crown for adult */}
      {stage === 4 && <Crown x={55} y={headCy - headR * scl * 0.85 - 18} scl={0.85} />}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BIRD SVG (Stages 2-4)
// ═══════════════════════════════════════════════════════════════════════════════

const BirdSVG = ({ species, mood, stage, size, interaction }) => {
  const colors = speciesColors[species] || speciesColors.passaro;
  const scl = sizeScales[stage] || 1;
  const isEating = interaction === 'feed';
  const isPetting = interaction === 'pet';
  const isPlaying = interaction === 'play';
  const anim = isPlaying ? excitedAnim : isEating ? eatAnim : moodAnimations[mood] || floatAnim;
  const isChibi = stage === 2;
  const isAdult = stage === 4;
  const iris = colors.iris || '#1E88E5';

  const headR = isChibi ? 28 : isAdult ? 25 : 26;
  const bodyRx = isChibi ? 22 : isAdult ? 27 : 24;
  const bodyRy = isChibi ? 28 : isAdult ? 34 : 30;
  const headCy = isChibi ? 48 : 52;
  const headCx = 70;
  const eyeR = isChibi ? 7.5 : isAdult ? 6.5 : 7;
  const bodyCy = headCy + bodyRy * 1.05;

  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 140 160"
      style={{ animation: `${anim} ${isPlaying ? '1s' : '2.5s'} ease-in-out infinite` }}>
      <ShadowFilter />
      <GradientDefs species={species} id="bird" />

      <SoftShadow cx="70" cy="152" rx={bodyRx * scl + 4} ry="5" />

      {isAdult && <GoldenAura cx="70" cy={(headCy + bodyCy) / 2} rx={bodyRx * scl + 14} ry={(bodyRy + headR) * scl / 2 + 14} />}

      {/* Tail feathers */}
      <path d={`M${70 + bodyRx * scl * 0.6},${bodyCy + bodyRy * scl * 0.2} L${70 + bodyRx * scl * 1.6},${bodyCy - bodyRy * scl * 0.2} L${70 + bodyRx * scl * 1.3},${bodyCy - bodyRy * scl * 0.05} L${70 + bodyRx * scl * 1.7},${bodyCy - bodyRy * scl * 0.35}`}
        fill={colors.secondary} opacity="0.85" />

      {/* Body */}
      <ellipse cx="70" cy={bodyCy} rx={bodyRx * scl} ry={bodyRy * scl} fill="url(#bird-body)" />
      <ellipse cx="70" cy={bodyCy + 4} rx={(bodyRx - 6) * scl} ry={(bodyRy - 8) * scl} fill="url(#bird-belly)" />

      {/* Wings */}
      <ellipse cx={70 - bodyRx * scl * 0.85} cy={bodyCy - bodyRy * scl * 0.05}
        rx={isChibi ? 8 * scl : 12 * scl} ry={isChibi ? 6 * scl : 9 * scl}
        fill={colors.secondary} transform={`rotate(18, ${70 - bodyRx * scl * 0.85}, ${bodyCy - bodyRy * scl * 0.05})`}
        style={{ animation: (mood === 'energico' || mood === 'brincalhao' || isPlaying) ? `${pulseAnim} 0.5s ease-in-out infinite` : 'none' }} />
      <ellipse cx={70 + bodyRx * scl * 0.85} cy={bodyCy - bodyRy * scl * 0.05}
        rx={isChibi ? 8 * scl : 12 * scl} ry={isChibi ? 6 * scl : 9 * scl}
        fill={colors.secondary} transform={`rotate(-18, ${70 + bodyRx * scl * 0.85}, ${bodyCy - bodyRy * scl * 0.05})`} />

      {/* Stick legs + feet */}
      <line x1={70 - 6 * scl} y1={bodyCy + bodyRy * scl} x2={70 - 8 * scl} y2={bodyCy + bodyRy * scl + 11 * scl}
        stroke={colors.nose} strokeWidth={scl * 2.2} strokeLinecap="round" />
      <line x1={70 + 6 * scl} y1={bodyCy + bodyRy * scl} x2={70 + 8 * scl} y2={bodyCy + bodyRy * scl + 11 * scl}
        stroke={colors.nose} strokeWidth={scl * 2.2} strokeLinecap="round" />
      <line x1={70 - 13 * scl} y1={bodyCy + bodyRy * scl + 11 * scl} x2={70 - 3 * scl} y2={bodyCy + bodyRy * scl + 11 * scl}
        stroke={colors.nose} strokeWidth={scl * 2} strokeLinecap="round" />
      <line x1={70 + 3 * scl} y1={bodyCy + bodyRy * scl + 11 * scl} x2={70 + 13 * scl} y2={bodyCy + bodyRy * scl + 11 * scl}
        stroke={colors.nose} strokeWidth={scl * 2} strokeLinecap="round" />

      {/* Crest feathers */}
      <ellipse cx={headCx - 3 * scl} cy={headCy - headR * scl * 0.88} rx={2.5 * scl} ry={7 * scl}
        fill={colors.secondary} transform={`rotate(-12, ${headCx - 3 * scl}, ${headCy - headR * scl * 0.88})`} />
      <ellipse cx={headCx + 3 * scl} cy={headCy - headR * scl * 0.92} rx={2 * scl} ry={6 * scl}
        fill={colors.primary} transform={`rotate(10, ${headCx + 3 * scl}, ${headCy - headR * scl * 0.92})`} />
      {isAdult && (
        <ellipse cx={headCx} cy={headCy - headR * scl * 0.95} rx={3 * scl} ry={8 * scl}
          fill={colors.nose} transform={`rotate(-5, ${headCx}, ${headCy - headR * scl * 0.95})`} opacity="0.7" />
      )}

      {/* Head */}
      <circle cx={headCx} cy={headCy} r={headR * scl} fill="url(#bird-head)" />
      <circle cx={headCx - 3} cy={headCy - headR * scl * 0.18} r={headR * scl * 0.35} fill="white" opacity="0.1" />

      {/* Mood features */}
      <MoodFeatures mood={mood} headCy={headCy} headR={headR * scl} scl={scl} species={species} />

      {/* Eyes */}
      {mood === 'sonolento' ? (
        <g>
          <path d={`M${headCx - headR * 0.35 * scl},${headCy - 1 * scl} Q${headCx - headR * 0.18 * scl},${headCy - 4 * scl} ${headCx - headR * 0.02 * scl},${headCy - 1 * scl}`}
            stroke="#555" strokeWidth={scl * 2} fill="none" strokeLinecap="round" />
          <path d={`M${headCx + headR * 0.02 * scl},${headCy - 1 * scl} Q${headCx + headR * 0.18 * scl},${headCy - 4 * scl} ${headCx + headR * 0.35 * scl},${headCy - 1 * scl}`}
            stroke="#555" strokeWidth={scl * 2} fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <KawaiiEye cx={headCx - headR * 0.22 * scl} cy={headCy - 1 * scl} r={eyeR * scl} closed={mood === 'triste'} big={mood === 'energico'} scl={scl} irisColor={iris} mood={mood} />
          <KawaiiEye cx={headCx + headR * 0.22 * scl} cy={headCy - 1 * scl} r={eyeR * scl} closed={mood === 'triste'} big={mood === 'energico'} scl={scl} irisColor={iris} mood={mood} />
        </g>
      )}

      {/* Orange beak */}
      {(mood === 'feliz' || mood === 'brincalhao' || isPlaying) ? (
        <g>
          <polygon points={`${headCx + headR * 0.55 * scl},${headCy - 2 * scl} ${headCx + headR * 1.15 * scl},${headCy - 4 * scl} ${headCx + headR * 0.55 * scl},${headCy + 1 * scl}`}
            fill={colors.nose} />
          <polygon points={`${headCx + headR * 0.55 * scl},${headCy + 1 * scl} ${headCx + headR * 1.1 * scl},${headCy + 5 * scl} ${headCx + headR * 0.55 * scl},${headCy + 4 * scl}`}
            fill="#EF6C00" />
        </g>
      ) : mood === 'com_fome' ? (
        <g>
          <polygon points={`${headCx + headR * 0.55 * scl},${headCy} ${headCx + headR * 1.15 * scl},${headCy + 2 * scl} ${headCx + headR * 0.55 * scl},${headCy + 5 * scl}`}
            fill="#EF6C00" />
        </g>
      ) : (
        <polygon points={`${headCx + headR * 0.55 * scl},${headCy - 0.5 * scl} ${headCx + headR * 1.15 * scl},${headCy + 2 * scl} ${headCx + headR * 0.55 * scl},${headCy + 4.5 * scl}`}
          fill={colors.nose} />
      )}

      {/* Cheeks */}
      <ellipse cx={headCx - headR * 0.42 * scl} cy={headCy + headR * 0.2 * scl} rx={5 * scl} ry={3.5 * scl}
        fill="#F8BBD0" opacity={isPetting ? 0.8 : 0.5} />
      <ellipse cx={headCx + headR * 0.18 * scl} cy={headCy + headR * 0.2 * scl} rx={5 * scl} ry={3.5 * scl}
        fill="#F8BBD0" opacity={isPetting ? 0.8 : 0.5} />

      {/* Crown for adult */}
      {stage === 4 && <Crown x={headCx - 12} y={headCy - headR * scl * 1.2 - 10} scl={0.75} />}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TURTLE SVG (Stages 2-4)
// ═══════════════════════════════════════════════════════════════════════════════

const TurtleSVG = ({ species, mood, stage, size, interaction }) => {
  const colors = speciesColors[species] || speciesColors.tartaruga;
  const scl = sizeScales[stage] || 1;
  const isEating = interaction === 'feed';
  const isPetting = interaction === 'pet';
  const isPlaying = interaction === 'play';
  const anim = isPlaying ? excitedAnim : isEating ? eatAnim : moodAnimations[mood] || floatAnim;
  const isChibi = stage === 2;
  const isAdult = stage === 4;
  const iris = colors.iris || '#2E7D32';

  const headR = isChibi ? 26 : isAdult ? 21 : 20;
  const shellRx = isChibi ? 30 : isAdult ? 42 : 37;
  const shellRy = isChibi ? 26 : isAdult ? 35 : 30;
  const shellCy = isChibi ? 98 : 94;
  const headCy = isChibi ? 48 : 56;
  const eyeR = isChibi ? 8 : isAdult ? 6.5 : 7;
  const legRx = isChibi ? 8 : isAdult ? 12 : 10;
  const legRy = isChibi ? 6 : isAdult ? 9 : 8;

  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 140 160"
      style={{ animation: `${anim} ${isPlaying ? '1s' : '3s'} ease-in-out infinite` }}>
      <ShadowFilter />
      <GradientDefs species={species} id="turtle" />

      <SoftShadow cx="70" cy="152" rx={shellRx * scl + 2} ry="6" />

      {isAdult && <GoldenAura cx="70" cy={(headCy + shellCy) / 2} rx={shellRx * scl + 14} ry={(shellRy + headR) * scl / 2 + 14} />}

      {/* Stubby back legs */}
      <ellipse cx={70 - shellRx * scl * 0.5} cy={shellCy + shellRy * scl * 0.5}
        rx={legRx * scl} ry={legRy * scl} fill={colors.primary} />
      <ellipse cx={70 + shellRx * scl * 0.5} cy={shellCy + shellRy * scl * 0.5}
        rx={legRx * scl} ry={legRy * scl} fill={colors.primary} />
      {/* Stubby front legs */}
      <ellipse cx={70 - shellRx * scl * 0.62} cy={shellCy - shellRy * scl * 0.12}
        rx={legRx * 1.1 * scl} ry={legRy * 1.1 * scl} fill={colors.primary} />
      <ellipse cx={70 + shellRx * scl * 0.62} cy={shellCy - shellRy * scl * 0.12}
        rx={legRx * 1.1 * scl} ry={legRy * 1.1 * scl} fill={colors.primary} />
      {/* Leg highlights */}
      <ellipse cx={70 - shellRx * scl * 0.57} cy={shellCy - shellRy * scl * 0.18}
        rx={legRx * 0.5 * scl} ry={legRy * 0.5 * scl} fill={colors.accent} opacity="0.5" />
      <ellipse cx={70 + shellRx * scl * 0.57} cy={shellCy - shellRy * scl * 0.18}
        rx={legRx * 0.5 * scl} ry={legRy * 0.5 * scl} fill={colors.accent} opacity="0.5" />

      {/* Shell */}
      <ellipse cx="70" cy={shellCy} rx={shellRx * scl} ry={shellRy * scl} fill="url(#turtle-shell)" />
      {/* Shell inner pattern */}
      <ellipse cx="70" cy={shellCy - 2} rx={(shellRx - 4) * scl} ry={(shellRy - 4) * scl} fill={colors.primary} opacity="0.3" />

      {/* Shell pattern */}
      <g opacity="0.4">
        <ellipse cx="70" cy={shellCy} rx={(shellRx - 8) * scl} ry={(shellRy - 8) * scl}
          fill="none" stroke={colors.secondary} strokeWidth={scl * 1.5} />
        <polygon points={`70,${shellCy - 10 * scl} 77,${shellCy - 5 * scl} 77,${shellCy + 5 * scl} 70,${shellCy + 10 * scl} 63,${shellCy + 5 * scl} 63,${shellCy - 5 * scl}`}
          fill="none" stroke={colors.secondary} strokeWidth={scl * 1.2} />
        {isAdult && Array.from({ length: 8 }, (_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const cx = 70 + Math.cos(angle) * (shellRx - 6) * scl;
          const cy = shellCy + Math.sin(angle) * (shellRy - 6) * scl;
          return <circle key={i} cx={cx} cy={cy} r={4 * scl} fill={colors.accent} opacity="0.5" />;
        })}
      </g>

      {/* Shell rim highlight */}
      <path d={`M${70 - shellRx * 0.65 * scl},${shellCy - shellRy * 0.88 * scl} Q70,${shellCy - shellRy * 1.05 * scl} ${70 + shellRx * 0.65 * scl},${shellCy - shellRy * 0.88 * scl}`}
        fill="none" stroke="white" strokeWidth={scl * 1.5} opacity="0.2" />

      {/* Cute bow on shell (baby) */}
      {isChibi && (
        <g transform={`translate(${70 + shellRx * scl * 0.45}, ${shellCy - shellRy * scl * 0.55})`}>
          <ellipse cx="-4" cy="0" rx={4.5 * scl} ry={2.5 * scl} fill="#F48FB1" opacity="0.8" />
          <ellipse cx="4" cy="0" rx={4.5 * scl} ry={2.5 * scl} fill="#F48FB1" opacity="0.8" />
          <circle cx="0" cy="0" r={1.8 * scl} fill="#E91E63" />
        </g>
      )}

      {/* Neck */}
      <rect x={70 - 6 * scl} y={headCy + headR * scl * 0.5} width={12 * scl} height={(shellCy - shellRy * scl * 0.3 - headCy - headR * scl * 0.5)} rx={6 * scl} fill={colors.primary} />

      {/* Head */}
      <circle cx="70" cy={headCy} r={headR * scl} fill="url(#turtle-head)" />
      <circle cx={66} cy={headCy - headR * scl * 0.18} r={headR * scl * 0.38} fill="white" opacity="0.1" />

      {/* Mood features */}
      <MoodFeatures mood={mood} headCy={headCy} headR={headR * scl} scl={scl} species={species} />

      {/* Eyes */}
      {mood === 'sonolento' ? (
        <g>
          <path d={`M${70 - headR * 0.35 * scl},${headCy - 2 * scl} Q${70 - headR * 0.18 * scl},${headCy - 5 * scl} ${70 - headR * 0.02 * scl},${headCy - 2 * scl}`}
            stroke="#555" strokeWidth={scl * 2} fill="none" strokeLinecap="round" />
          <path d={`M${70 + headR * 0.02 * scl},${headCy - 2 * scl} Q${70 + headR * 0.18 * scl},${headCy - 5 * scl} ${70 + headR * 0.35 * scl},${headCy - 2 * scl}`}
            stroke="#555" strokeWidth={scl * 2} fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <KawaiiEye cx={70 - headR * 0.24 * scl} cy={headCy - 2 * scl} r={eyeR * scl} closed={false} big={mood === 'energico'} scl={scl} irisColor={iris} mood={mood} />
          <KawaiiEye cx={70 + headR * 0.24 * scl} cy={headCy - 2 * scl} r={eyeR * scl} closed={false} big={mood === 'energico'} scl={scl} irisColor={iris} mood={mood} />
        </g>
      )}

      {/* Tiny nose dots */}
      <circle cx={70 - 2 * scl} cy={headCy + headR * 0.22 * scl} r={1.3 * scl} fill={colors.nose} />
      <circle cx={70 + 2 * scl} cy={headCy + headR * 0.22 * scl} r={1.3 * scl} fill={colors.nose} />

      {/* Mouth */}
      {mood === 'feliz' && (
        <path d={`M${70 - headR * 0.18 * scl},${headCy + headR * 0.35 * scl} Q70,${headCy + headR * 0.5 * scl} ${70 + headR * 0.18 * scl},${headCy + headR * 0.35 * scl}`}
          stroke="#555" strokeWidth={scl * 1.3} fill="none" />
      )}
      {mood === 'triste' && (
        <path d={`M${70 - headR * 0.18 * scl},${headCy + headR * 0.48 * scl} Q70,${headCy + headR * 0.35 * scl} ${70 + headR * 0.18 * scl},${headCy + headR * 0.48 * scl}`}
          stroke="#555" strokeWidth={scl * 1.3} fill="none" />
      )}
      {mood === 'com_fome' && (
        <ellipse cx="70" cy={headCy + headR * 0.4 * scl} rx={3.5 * scl} ry={3 * scl} fill="#888" />
      )}
      {!['feliz', 'triste', 'com_fome'].includes(mood) && (
        <path d={`M${70 - headR * 0.14 * scl},${headCy + headR * 0.3 * scl} Q${70 - headR * 0.05 * scl},${headCy + headR * 0.42 * scl} 70,${headCy + headR * 0.35 * scl} Q${70 + headR * 0.05 * scl},${headCy + headR * 0.42 * scl} ${70 + headR * 0.14 * scl},${headCy + headR * 0.3 * scl}`}
          stroke="#555" strokeWidth={scl * 1.2} fill="none" />
      )}

      {/* Cheeks */}
      <ellipse cx={70 - headR * 0.46 * scl} cy={headCy + headR * 0.18 * scl} rx={6 * scl} ry={3.5 * scl}
        fill="#F8BBD0" opacity={isPetting ? 0.8 : 0.55} />
      <ellipse cx={70 + headR * 0.46 * scl} cy={headCy + headR * 0.18 * scl} rx={6 * scl} ry={3.5 * scl}
        fill="#F8BBD0" opacity={isPetting ? 0.8 : 0.55} />

      {/* Crown for adult */}
      {stage === 4 && <Crown x={55} y={headCy - headR * scl - 16} scl={0.8} />}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SPEECH BUBBLE
// ═══════════════════════════════════════════════════════════════════════════════

const SpeechBubble = ({ text, visible }) => {
  if (!visible) return null;
  return (
    <Box sx={{
      position: 'relative', background: 'white', borderRadius: 3, px: 2.5, py: 1.5,
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)', mb: 1, maxWidth: 280, mx: 'auto',
      animation: `${floatAnim} 3s ease-in-out infinite`
    }}>
      <Typography variant="body2" textAlign="center" fontWeight={500} color="text.primary">
        {text}
      </Typography>
      <Box sx={{
        position: 'absolute', bottom: -8, left: '50%', ml: '-8px',
        width: 0, height: 0,
        borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
        borderTop: '8px solid white'
      }} />
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PET ANIMATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const PetAnimation = ({ species, mood = 'feliz', evolutionStage = 1, size = 180, onInteract, excited, interaction = null }) => {
  const [hearts, setHearts] = useState(false);
  const [sparkles, setSparkles] = useState(false);
  const [showSpeech, setShowSpeech] = useState(true);
  const [activeParticles, setActiveParticles] = useState({ food: false, hearts: false, stars: false, blush: false });

  useEffect(() => { setShowSpeech(true); }, [evolutionStage]);

  const clearParticle = useCallback((key) => {
    setActiveParticles(prev => ({ ...prev, [key]: false }));
  }, []);

  useEffect(() => {
    if (interaction === 'feed') {
      setActiveParticles(prev => ({ ...prev, food: true }));
      const t = setTimeout(() => clearParticle('food'), 1500);
      return () => clearTimeout(t);
    }
    if (interaction === 'pet') {
      setActiveParticles(prev => ({ ...prev, hearts: true, blush: true }));
      const t1 = setTimeout(() => clearParticle('hearts'), 1400);
      const t2 = setTimeout(() => clearParticle('blush'), 1800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    if (interaction === 'play') {
      setActiveParticles(prev => ({ ...prev, stars: true }));
      const t = setTimeout(() => clearParticle('stars'), 1200);
      return () => clearTimeout(t);
    }
  }, [interaction, clearParticle]);

  const handleTap = useCallback(() => {
    setHearts(true);
    setSparkles(true);
    setActiveParticles(prev => ({ ...prev, hearts: true, blush: true }));
    setTimeout(() => setHearts(false), 1200);
    setTimeout(() => setSparkles(false), 2000);
    setTimeout(() => clearParticle('hearts'), 1200);
    setTimeout(() => clearParticle('blush'), 1600);
    if (onInteract) onInteract();
  }, [onInteract, clearParticle]);

  useEffect(() => {
    if (excited) {
      setSparkles(true);
      setActiveParticles(prev => ({ ...prev, stars: true }));
      setTimeout(() => setSparkles(false), 2000);
      setTimeout(() => clearParticle('stars'), 1200);
    }
  }, [excited, clearParticle]);

  const renderPet = () => {
    if (evolutionStage === 1) {
      return <EggSVG species={species} mood={mood} size={size} interaction={interaction} />;
    }
    switch (species) {
      case 'gato': return <CatSVG species={species} mood={mood} stage={evolutionStage} size={size} interaction={interaction} />;
      case 'cao': return <DogSVG species={species} mood={mood} stage={evolutionStage} size={size} interaction={interaction} />;
      case 'passaro': return <BirdSVG species={species} mood={mood} stage={evolutionStage} size={size} interaction={interaction} />;
      case 'tartaruga': return <TurtleSVG species={species} mood={mood} stage={evolutionStage} size={size} interaction={interaction} />;
      default: return <CatSVG species={species} mood={mood} stage={evolutionStage} size={size} interaction={interaction} />;
    }
  };

  const stageGlow = evolutionStage >= 3;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <SpeechBubble text={stageDescriptions[evolutionStage]} visible={showSpeech} />

      <Box
        onClick={handleTap}
        sx={{
          cursor: 'pointer', position: 'relative', display: 'inline-flex',
          animation: stageGlow ? `${glowAnim} 3s ease-in-out infinite` : (interaction === 'feed' ? `${happyBounce} 0.6s ease-in-out 2` : 'none'),
          transition: 'transform 0.1s',
          '&:active': { transform: 'scale(0.95)' }
        }}
      >
        {/* Particle effects */}
        <FoodParticles show={activeParticles.food} />
        <HeartParticles show={activeParticles.hearts || hearts} />
        <StarBurstEffect show={activeParticles.stars} />
        <SparkleEffect show={sparkles || interaction === 'play'} />
        <ZzzEffect show={mood === 'sonolento'} />
        <BlushEffect show={activeParticles.blush || interaction === 'pet'} />

        {renderPet()}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          {stageNames[evolutionStage]}
        </Typography>
        {evolutionStage < 4 && (
          <Typography variant="caption" color="text.disabled">
            → Próximo: Nv.{evolutionStage === 1 ? 5 : evolutionStage === 2 ? 10 : 15}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PetAnimation;
