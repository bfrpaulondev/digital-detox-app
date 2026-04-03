import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, keyframes } from '@mui/material';

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════

const floatAnim = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;
/* bounceAnim reserved for future use */
const wobbleAnim = keyframes`
  0%, 100% { transform: rotate(-4deg) translateY(0); }
  25% { transform: rotate(0deg) translateY(-3px); }
  50% { transform: rotate(4deg) translateY(0); }
  75% { transform: rotate(0deg) translateY(-3px); }
`;
const sleepAnim = keyframes`
  0%, 100% { transform: translateY(2px) rotate(-3deg); }
  50% { transform: translateY(5px) rotate(3deg); }
`;
const excitedAnim = keyframes`
  0% { transform: translateY(0) rotate(0deg) scale(1); }
  10% { transform: translateY(-15px) rotate(-5deg) scale(1.05); }
  20% { transform: translateY(-5px) rotate(3deg) scale(0.98); }
  30% { transform: translateY(-20px) rotate(-4deg) scale(1.06); }
  40% { transform: translateY(0) rotate(2deg) scale(0.97); }
  50% { transform: translateY(-12px) rotate(-3deg) scale(1.03); }
  60% { transform: translateY(0) rotate(1deg) scale(0.99); }
  70% { transform: translateY(-8px) rotate(-2deg) scale(1.02); }
  80% { transform: translateY(0) rotate(0deg) scale(1); }
  100% { transform: translateY(0) rotate(0deg) scale(1); }
`;
const heartFloat = keyframes`
  0% { opacity: 1; transform: translateY(0) scale(0.4) rotate(0deg); }
  50% { opacity: 0.8; transform: translateY(-30px) scale(1.2) rotate(-10deg); }
  100% { opacity: 0; transform: translateY(-60px) scale(0.3) rotate(15deg); }
`;
const sparklePop = keyframes`
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
`;
const zzzAnim = keyframes`
  0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
  50% { opacity: 0.8; transform: translate(10px, -15px) scale(1.1); }
  100% { opacity: 0; transform: translate(25px, -35px) scale(0.6); }
`;
const foodFloat = keyframes`
  0% { opacity: 0; transform: translateY(10px) scale(0.3); }
  20% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-40px) scale(0.2); }
`;
const starBurst = keyframes`
  0% { opacity: 1; transform: translate(0,0) scale(0.3) rotate(0deg); }
  100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(1) rotate(360deg); }
`;
const eatBob = keyframes`
  0%, 100% { transform: rotate(0deg) translateY(0); }
  20% { transform: rotate(5deg) translateY(3px); }
  40% { transform: rotate(-3deg) translateY(0); }
  60% { transform: rotate(4deg) translateY(2px); }
  80% { transform: rotate(-2deg) translateY(0); }
`;
const tailWag = keyframes`
  0%, 100% { transform: rotate(-15deg); }
  50% { transform: rotate(15deg); }
`;
const wingFlap = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-20deg); }
  75% { transform: rotate(10deg); }
`;
const shimmerAnim = keyframes`
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
`;
const blushPop = keyframes`
  0% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 0.7; transform: scale(1.2); }
  100% { opacity: 0.5; transform: scale(1); }
`;
/* happyBounce reserved for future use */
const goldenGlow = keyframes`
  0%, 100% { opacity: 0.12; }
  50% { opacity: 0.3; }
`;
const hopAnim = keyframes`
  0%, 100% { transform: translateY(0) scaleY(1) scaleX(1); }
  15% { transform: translateY(2px) scaleY(0.85) scaleX(1.1); }
  30% { transform: translateY(-25px) scaleY(1.05) scaleX(0.95); }
  50% { transform: translateY(0) scaleY(1) scaleX(1); }
`;
const squishAnim = keyframes`
  0%, 100% { transform: scaleX(1) scaleY(1); }
  25% { transform: scaleX(1.08) scaleY(0.92); }
  50% { transform: scaleX(0.95) scaleY(1.05); }
  75% { transform: scaleX(1.04) scaleY(0.96); }
`;
const blinkAnim = keyframes`
  0%, 90%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
`;
const pawWaveAnim = keyframes`
  0%, 100% { transform: rotate(-15deg) translateY(-8px); }
  50% { transform: rotate(15deg) translateY(-12px); }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

/* stageDescriptions reserved for future use */

export const stageNames = { 1: 'Ovo', 2: 'Bebé', 3: 'Jovem', 4: 'Adulto' };

export const moodAnimations = {
  feliz: floatAnim,
  triste: sleepAnim,
  sonolento: sleepAnim,
  energico: hopAnim,
  com_fome: wobbleAnim,
  brincalhao: squishAnim,
  doente: wobbleAnim
};

export const speciesColors = {
  gato: { primary: '#C49A6C', secondary: '#A0724A', accent: '#F0E0D0', belly: '#FFF5EC', nose: '#5D4037', inner: '#FFCCBC', iris: '#7B4B2A', dark: '#8D6E63' },
  cao: { primary: '#FFB347', secondary: '#FF8C00', accent: '#FFF0D9', belly: '#FFF8F0', nose: '#FF6B8A', inner: '#FFB6C1', iris: '#FF6D00', dark: '#E67600' },
  passaro: { primary: '#7EC8E3', secondary: '#42A5F5', accent: '#D4EEFF', belly: '#F0F8FF', nose: '#FFA726', inner: '#FFE082', iris: '#1565C0', dark: '#1976D2' },
  tartaruga: { primary: '#81C784', secondary: '#4CAF50', accent: '#C8E6C9', belly: '#F1F8E9', nose: '#2E7D32', inner: '#A5D6A7', iris: '#1B5E20', dark: '#388E3C' }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICLE EFFECTS
// ═══════════════════════════════════════════════════════════════════════════════

const HeartParticles = ({ show }) => {
  if (!show) return null;
  const hearts = [
    { left: '25%', delay: '0s', size: 24 }, { left: '50%', delay: '0.1s', size: 28 },
    { left: '72%', delay: '0.2s', size: 22 }, { left: '35%', delay: '0.3s', size: 20 },
    { left: '62%', delay: '0.15s', size: 26 }, { left: '18%', delay: '0.25s', size: 18 },
  ];
  return (
    <Box sx={{ position: 'absolute', top: '8%', left: 0, right: 0, height: '55%', pointerEvents: 'none', zIndex: 10 }}>
      {hearts.map((h, i) => (
        <Box key={i} sx={{
          position: 'absolute', left: h.left, top: 0, fontSize: h.size,
          animation: `${heartFloat} 1.2s ease-out ${h.delay} forwards`,
          filter: 'drop-shadow(0 0 4px rgba(255,107,138,0.5))'
        }}>❤️</Box>
      ))}
    </Box>
  );
};

const SparkleEffect = ({ show }) => {
  const sparkles = useMemo(() => Array.from({ length: 5 }, (_, i) => ({
    top: `${15 + ((i * 37) % 70)}%`, left: `${12 + ((i * 43) % 76)}%`,
    delay: `${(i * 0.2) % 0.8}s`, size: 10 + ((i * 3) % 8),
  })), []);
  if (!show) return null;
  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
      {sparkles.map((s, i) => (
        <Box key={i} sx={{
          position: 'absolute', top: s.top, left: s.left, fontSize: s.size,
          animation: `${sparklePop} 1.3s ease-in-out ${s.delay} infinite`
        }}>✨</Box>
      ))}
    </Box>
  );
};

const StarBurst = ({ show }) => {
  if (!show) return null;
  const dirs = [
    { '--tx': '-30px', '--ty': '-25px', left: '42%', top: '22%', delay: '0s' },
    { '--tx': '28px', '--ty': '-30px', left: '58%', top: '22%', delay: '0.05s' },
    { '--tx': '-35px', '--ty': '8px', left: '28%', top: '45%', delay: '0.1s' },
    { '--tx': '35px', '--ty': '8px', left: '72%', top: '45%', delay: '0.08s' },
    { '--tx': '0px', '--ty': '-38px', left: '50%', top: '12%', delay: '0.12s' },
    { '--tx': '-22px', '--ty': '-18px', left: '35%', top: '32%', delay: '0.15s' },
    { '--tx': '22px', '--ty': '-18px', left: '65%', top: '32%', delay: '0.03s' },
  ];
  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {dirs.map((d, i) => (
        <Box key={i} sx={{
          position: 'absolute', left: d.left, top: d.top, fontSize: 16,
          animation: `${starBurst} 0.8s ease-out ${d.delay} forwards`,
          '--tx': d['--tx'], '--ty': d['--ty']
        }}>⭐</Box>
      ))}
    </Box>
  );
};

const FoodParticles = ({ show }) => {
  if (!show) return null;
  const foods = ['🍖', '🥕', '🍎', '🐟', '🧀', '🍗'];
  return (
    <Box sx={{ position: 'absolute', top: '12%', left: 0, right: 0, pointerEvents: 'none', zIndex: 10 }}>
      {foods.map((f, i) => (
        <Box key={i} sx={{
          position: 'absolute', left: `${20 + i * 12}%`, fontSize: 20,
          animation: `${foodFloat} 1s ease-out ${i * 0.1}s forwards`
        }}>{f}</Box>
      ))}
    </Box>
  );
};

const ZzzEffect = ({ show }) => {
  if (!show) return null;
  return (
    <Box sx={{ position: 'absolute', top: '2%', right: '5%', pointerEvents: 'none', zIndex: 10 }}>
      {[0, 1, 2].map(i => (
        <Typography key={i} sx={{
          position: 'absolute', top: i * 18, right: i * 14,
          fontSize: 14 + i * 6, fontWeight: 800, color: '#CE93D8',
          animation: `${zzzAnim} 2s ease-in-out ${i * 0.5}s infinite`,
          fontFamily: '"Comic Sans MS", cursive', textShadow: '0 0 8px rgba(206,147,216,0.5)'
        }}>Z</Typography>
      ))}
    </Box>
  );
};

const BlushEffect = ({ show }) => {
  if (!show) return null;
  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 8 }}>
      <Box sx={{
        position: 'absolute', top: '35%', left: '15%', width: 40, height: 24,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(255,150,180,0.55) 0%, transparent 70%)',
        animation: `${blushPop} 0.4s ease-out forwards`
      }} />
      <Box sx={{
        position: 'absolute', top: '35%', right: '15%', width: 40, height: 24,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(255,150,180,0.55) 0%, transparent 70%)',
        animation: `${blushPop} 0.4s ease-out 0.08s forwards`
      }} />
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// KAWAII EYE - Big anime eyes with colored iris
// ═══════════════════════════════════════════════════════════════════════════════

const KawaiiEye = ({ cx, cy, r, closed = false, big = false, irisColor = '#333', mood }) => {
  if (closed) {
    return (
      <path d={`M${cx - r},${cy + 1} Q${cx},${cy - r * 0.7} ${cx + r},${cy + 1}`}
        stroke="#555" strokeWidth={Math.max(1.5, r * 0.28)} fill="none" strokeLinecap="round" />
    );
  }
  if (mood === 'doente') {
    return (
      <g>
        <circle cx={cx} cy={cy} r={r * 0.9} fill="white" stroke="#bbb" strokeWidth={1} />
        <line x1={cx - r * 0.4} y1={cy - r * 0.4} x2={cx + r * 0.4} y2={cy + r * 0.4} stroke="#999" strokeWidth={1.5} />
        <line x1={cx + r * 0.4} y1={cy - r * 0.4} x2={cx - r * 0.4} y2={cy + r * 0.4} stroke="#999" strokeWidth={1.5} />
      </g>
    );
  }

  const eyeR = big ? r * 1.4 : r;
  const irisR = eyeR * 0.68;
  const pupilR = irisR * 0.5;
  const iris = irisColor || '#333';

  return (
    <g>
      {/* White of eye */}
      <ellipse cx={cx} cy={cy} rx={eyeR} ry={eyeR * 1.05} fill="white" stroke="#777" strokeWidth={1} />
      {/* Iris */}
      <circle cx={cx} cy={cy + 1} r={irisR} fill={iris} />
      {/* Iris ring */}
      <circle cx={cx} cy={cy + 1} r={irisR * 0.95} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth={0.8} />
      {/* Pupil */}
      <circle cx={cx} cy={cy + 2} r={pupilR} fill="#111" />
      {/* Big sparkle highlight */}
      <ellipse cx={cx - eyeR * 0.25} cy={cy - eyeR * 0.25} rx={eyeR * 0.22} ry={eyeR * 0.28}
        fill="white" opacity="0.95" />
      {/* Small secondary highlight */}
      <circle cx={cx + eyeR * 0.3} cy={cy + eyeR * 0.2} r={eyeR * 0.1} fill="white" opacity="0.7" />
      {/* Eyelid shadow (top) */}
      <ellipse cx={cx} cy={cy - eyeR * 0.6} rx={eyeR * 1.05} ry={eyeR * 0.35}
        fill="rgba(0,0,0,0.06)" />
    </g>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CROWN for adult stage
// ═══════════════════════════════════════════════════════════════════════════════

const Crown = ({ x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M3,18 L3,7 L9,13 L15,2 L21,13 L27,7 L27,18 Z" fill="#FFD700" stroke="#DAA520" strokeWidth="1.2" />
    <rect x="3" y="15" width="24" height="5" rx="1.5" fill="#FFC107" />
    <circle cx="9" cy="11" r="2.5" fill="#E91E63" /><circle cx="9" cy="11" r="1" fill="#FCE4EC" />
    <circle cx="15" cy="6" r="3" fill="#2196F3" /><circle cx="15" cy="6" r="1.2" fill="#E3F2FD" />
    <circle cx="21" cy="11" r="2.5" fill="#4CAF50" /><circle cx="21" cy="11" r="1" fill="#E8F5E9" />
    <circle cx="15" cy="17.5" r="2" fill="#FF9800" />
  </g>
);

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: get animation for pet wrapper
// ═══════════════════════════════════════════════════════════════════════════════

const useBlink = () => {
  const [blinking, setBlinking] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 200);
    }, 3500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);
  return blinking;
};

const getPetAnim = (mood, interaction) => {
  if (interaction === 'play') return excitedAnim;
  if (interaction === 'feed') return eatBob;
  return moodAnimations[mood] || floatAnim;
};

// ═══════════════════════════════════════════════════════════════════════════════
// EGG (Stage 1)
// ═══════════════════════════════════════════════════════════════════════════════

const EggSVG = ({ species, mood, size, interaction }) => {
  const c = speciesColors[species] || speciesColors.gato;
  const anim = getPetAnim(mood, interaction);
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 120 144" style={{ animation: `${anim} 3s ease-in-out infinite` }}>
      <defs>
        <radialGradient id={`egg-body-${species}`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor={c.primary} />
          <stop offset="100%" stopColor={c.secondary} />
        </radialGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="60" cy="136" rx="32" ry="6" fill="rgba(0,0,0,0.06)" />
      {/* Egg */}
      <ellipse cx="60" cy="68" rx="44" ry="56" fill={`url(#egg-body-${species})`} />
      {/* Shimmer */}
      <ellipse cx="48" cy="46" rx="16" ry="26" fill="white" opacity="0.15"
        style={{ animation: `${shimmerAnim} 2.5s ease-in-out infinite` }} />
      <ellipse cx="46" cy="40" rx="7" ry="13" fill="white" opacity="0.12" />
      {/* Speckles */}
      <circle cx="40" cy="40" r="4" fill={c.secondary} opacity="0.25" />
      <circle cx="76" cy="48" r="3" fill={c.secondary} opacity="0.2" />
      <circle cx="48" cy="86" r="3.5" fill={c.secondary} opacity="0.2" />
      <circle cx="70" cy="76" r="2.5" fill={c.secondary} opacity="0.25" />
      {/* Crack for energico */}
      {mood === 'energico' && (
        <path d="M52 20 L55 36 L48 46 L56 54" stroke={c.secondary} strokeWidth="2" fill="none" opacity="0.6" />
      )}
      {/* Face */}
      {mood === 'sonolento' ? (
        <g>
          <path d="M46,60 Q50,57 54,60" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M64,60 Q68,57 72,60" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M55,74 Q60,71 65,74" stroke="#555" strokeWidth="1.5" fill="none" />
        </g>
      ) : (
        <g>
          <KawaiiEye cx={50} cy={58} r={5} closed={false} big={mood === 'energico'} irisColor={c.iris} mood={mood} />
          <KawaiiEye cx={68} cy={58} r={5} closed={false} big={mood === 'energico'} irisColor={c.iris} mood={mood} />
          {mood === 'feliz' && <path d="M54,72 Q60,78 66,72" stroke="#555" strokeWidth="1.8" fill="none" />}
          {mood === 'com_fome' && <ellipse cx="60" cy="73" rx="4" ry="3.5" fill="#777" />}
          {mood === 'triste' && <path d="M54,76 Q60,70 66,76" stroke="#555" strokeWidth="1.8" fill="none" />}
          {mood === 'brincalhao' && <circle cx="60" cy="73" r="2.5" fill="#777" />}
          {mood === 'doente' && <path d="M54,76 Q60,80 66,76" stroke="#888" strokeWidth="1.5" fill="none" strokeDasharray="2 2" />}
        </g>
      )}
      {/* Blush */}
      <ellipse cx="42" cy="68" rx="6" ry="3" fill="#FFB6C1" opacity="0.4" />
      <ellipse cx="76" cy="68" rx="6" ry="3" fill="#FFB6C1" opacity="0.4" />
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BABY (Stage 2) - The cute chibi phase — HEAD IS 75% OF TOTAL
// ═══════════════════════════════════════════════════════════════════════════════

const BabyPetSVG = ({ species, mood, size, interaction }) => {
  const c = speciesColors[species] || speciesColors.gato;
  const anim = getPetAnim(mood, interaction);
  const isPetting = interaction === 'pet';
  const isPlaying = interaction === 'play';
  const blinking = useBlink();

  // Common baby proportions: HEAD DOMINANT
  const H = 100; // head center Y (big head area)
  const HR = 42; // head radius (huge!)
  const BR = 24; // body radius X
  const BRY = 18; // body radius Y
  const BY = 136; // body center Y

  const eyeR = 9; // giant eyes for babies
  const isSleeping = mood === 'sonolento';
  const isSad = mood === 'triste';
  const isHappy = mood === 'feliz' || mood === 'brincalhao';
  const isHungry = mood === 'com_fome';
  const isSick = mood === 'doente';
  const isExcited = mood === 'energico' || isPlaying;

  // Species-specific features
  const renderEars = () => {
    if (species === 'gato') return (
      <g>
        <polygon points={`${60 - 28},${H - 30} ${60 - 35},${H - 56} ${60 - 8},${H - 40}`} fill={c.primary} />
        <polygon points={`${60 + 28},${H - 30} ${60 + 35},${H - 56} ${60 + 8},${H - 40}`} fill={c.primary} />
        <polygon points={`${60 - 26},${H - 32} ${60 - 32},${H - 50} ${60 - 12},${H - 38}`} fill="#FFB6C1" />
        <polygon points={`${60 + 26},${H - 32} ${60 + 32},${H - 50} ${60 + 12},${H - 38}`} fill="#FFB6C1" />
      </g>
    );
    if (species === 'cao') return (
      <g>
        <ellipse cx={60 - 34} cy={H - 10} rx={14} ry={22} fill={c.secondary} transform="rotate(18,26,90)" />
        <ellipse cx={60 + 34} cy={H - 10} rx={14} ry={22} fill={c.secondary} transform="rotate(-18,94,90)" />
        <ellipse cx={60 - 31} cy={H - 7} rx={8} ry={15} fill="#FFB6C1" transform="rotate(18,29,93)" />
        <ellipse cx={60 + 31} cy={H - 7} rx={8} ry={15} fill="#FFB6C1" transform="rotate(-18,91,93)" />
      </g>
    );
    if (species === 'passaro') return (
      <g>
        <ellipse cx={60 - 10} cy={H - HR + 8} rx={6} ry={12} fill={c.secondary} transform="rotate(-15,50,66)" />
        <ellipse cx={60 + 10} cy={H - HR + 8} rx={6} ry={12} fill={c.secondary} transform="rotate(15,70,66)" />
        <ellipse cx={60 - 8} cy={H - HR + 10} rx={3.5} ry={8} fill={c.inner} transform="rotate(-15,52,68)" />
        <ellipse cx={60 + 8} cy={H - HR + 10} rx={3.5} ry={8} fill={c.inner} transform="rotate(15,68,68)" />
      </g>
    );
    return null; // tartaruga - no ears
  };

  const renderTail = () => {
    if (species === 'gato') return (
      <path d={`M${60 + BR * 0.9},${BY - 8} Q${60 + BR * 1.6},${BY - 30} ${60 + BR * 1.3},${BY - 40}`}
        stroke={c.dark} strokeWidth={5} fill="none" strokeLinecap="round" />
    );
    if (species === 'cao') return (
      <g style={{ transformOrigin: `${60 + BR * 0.85}px ${BY - 10}px`, animation: (isHappy || isPlaying) ? `${tailWag} 0.3s ease-in-out infinite` : 'none' }}>
        <path d={`M${60 + BR * 0.85},${BY - 10} Q${60 + BR * 1.6},${BY - 32} ${60 + BR * 1.3},${BY - 42}`}
          stroke={c.dark} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d={`M${60 + BR * 0.85},${BY - 10} Q${60 + BR * 1.6},${BY - 32} ${60 + BR * 1.3},${BY - 42}`}
          stroke={c.primary} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      </g>
    );
    if (species === 'passaro') return (
      <g style={{ animation: isExcited ? `${wingFlap} 0.3s ease-in-out infinite` : 'none' }}>
        <ellipse cx={60 - BR - 5} cy={BY - 12} rx={10} ry={16} fill={c.secondary} transform="rotate(-20,25,124)" />
        <ellipse cx={60 + BR + 5} cy={BY - 12} rx={10} ry={16} fill={c.secondary} transform="rotate(20,95,124)" />
      </g>
    );
    return null; // tartaruga no tail
  };

  const renderShell = () => {
    if (species === 'tartaruga') return (
      <g>
        <ellipse cx="60" cy={BY} rx={BR + 4} ry={BRY + 2} fill={c.secondary} />
        <ellipse cx="60" cy={BY} rx={BR} ry={BRY} fill={c.primary} />
        {/* Shell pattern - hexagonal center */}
        <polygon points="60,121 66,126 66,134 60,139 54,134 54,126" fill={c.accent} opacity="0.6" />
        <polygon points="66,126 72,121 78,126 78,134 72,139 66,134" fill={c.accent} opacity="0.5" />
        <polygon points="54,126 48,121 42,126 42,134 48,139 54,134" fill={c.accent} opacity="0.5" />
        <polygon points="60,113 66,108 72,113 66,118" fill={c.accent} opacity="0.4" />
        <polygon points="54,113 48,118 48,126 54,121" fill={c.accent} opacity="0.35" />
        <polygon points="66,113 72,118 72,126 66,121" fill={c.accent} opacity="0.35" />
        {/* Cute bow on shell */}
        <circle cx="60" cy={BY - BRY + 2} r="4" fill="#F48FB1" />
        <polygon points="56,121 52,118 56,120" fill="#F48FB1" />
        <polygon points="64,121 68,118 64,120" fill="#F48FB1" />
      </g>
    );
    // Default body (non-turtle)
    return (
      <g>
        <ellipse cx="60" cy={BY} rx={BR} ry={BRY} fill={c.primary} />
        <ellipse cx="60" cy={BY + 3} rx={BR - 6} ry={BRY - 5} fill={c.belly} />
      </g>
    );
  };

  const renderPaws = () => {
    if (species === 'tartaruga') {
      return (
        <g>
          <ellipse cx={60 - 18} cy={BY + BRY} rx="7" ry="5" fill={c.primary} stroke={c.secondary} strokeWidth="1" />
          <ellipse cx={60 + 18} cy={BY + BRY} rx="7" ry="5" fill={c.primary} stroke={c.secondary} strokeWidth="1" />
          <ellipse cx={60 - 8} cy={BY + BRY + 2} rx="6" ry="4" fill={c.primary} stroke={c.secondary} strokeWidth="1" />
          <ellipse cx={60 + 8} cy={BY + BRY + 2} rx="6" ry="4" fill={c.primary} stroke={c.secondary} strokeWidth="1" />
        </g>
      );
    }
    return (
      <g>
        <ellipse cx={60 - 14} cy={BY + BRY - 2} rx="8" ry="5" fill={c.secondary} />
        <ellipse cx={60 + 14} cy={BY + BRY - 2} rx="8" ry="5" fill={c.secondary} />
      </g>
    );
  };

  const renderMouth = () => {
    if (isSad) return <path d={`M${60 - 8},${H + 14} Q60,${H + 9} ${60 + 8},${H + 14}`} stroke="#555" strokeWidth="1.5" fill="none" />;
    if (isHungry) return <ellipse cx="60" cy={H + 14} rx="5" ry="4" fill="#888" />;
    if (isSick) return <path d={`M${60 - 6},${H + 14} Q60,${H + 18} ${60 + 6},${H + 14}`} stroke="#888" strokeWidth="1.5" fill="none" strokeDasharray="2 2" />;
    // Happy omega mouth
    return <path d={`M${60 - 8},${H + 10} Q${60 - 4},${H + 15} 60,${H + 12} Q${60 + 4},${H + 15} ${60 + 8},${H + 10}`} stroke="#555" strokeWidth="1.5" fill="none" />;
  };

  const renderNose = () => {
    if (species === 'tartaruga') return <circle cx="60" cy={H + 6} r="1.5" fill={c.nose} />;
    if (species === 'passaro') return (
      <g>
        <path d={`M${60 - 3},${H + 4} L60,${H + 10} L${60 + 3},${H + 4} Z`} fill={c.nose} />
        {isHappy && <path d={`M${60 - 5},${H + 11} L60,${H + 15} L${60 + 5},${H + 11}`} stroke={c.nose} strokeWidth="1.5" fill="none" />}
      </g>
    );
    if (species === 'cao') return <ellipse cx="60" cy={H + 5} rx="4" ry="3" fill={c.nose} />;
    // gato
    return <path d={`M${60 - 2},${H + 4} L60,${H + 7} L${60 + 2},${H + 4} Z`} fill={c.nose} />;
  };

  const renderWhiskers = () => {
    if (species !== 'gato') return null;
    return (
      <g>
        <line x1={60 - 38} y1={H + 2} x2={60 - 16} y2={H + 5} stroke="#ccc" strokeWidth="0.7" />
        <line x1={60 - 40} y1={H + 7} x2={60 - 16} y2={H + 8} stroke="#ccc" strokeWidth="0.7" />
        <line x1={60 + 16} y1={H + 5} x2={60 + 38} y2={H + 2} stroke="#ccc" strokeWidth="0.7" />
        <line x1={60 + 16} y1={H + 8} x2={60 + 40} y2={H + 7} stroke="#ccc" strokeWidth="0.7" />
      </g>
    );
  };

  const renderBirdLegs = () => {
    if (species !== 'passaro') return null;
    return (
      <g>
        <line x1={60 - 8} y1={BY + 10} x2={60 - 10} y2={BY + 22} stroke={c.nose} strokeWidth="2.5" strokeLinecap="round" />
        <line x1={60 + 8} y1={BY + 10} x2={60 + 10} y2={BY + 22} stroke={c.nose} strokeWidth="2.5" strokeLinecap="round" />
        {/* Feet */}
        <path d={`M${60 - 16},${BY + 22} L${60 - 10},${BY + 22} L${60 - 5},${BY + 22}`} stroke={c.nose} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d={`M${60 + 5},${BY + 22} L${60 + 10},${BY + 22} L${60 + 16},${BY + 22}`} stroke={c.nose} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    );
  };

  // Mood overlays
  const renderMoodOverlay = () => {
    if (isSad) return (
      <g>
        <circle cx="60" cy={H} r={HR} fill="rgba(0,0,0,0.06)" />
        <path d={`M${60 + HR * 0.55},${H + 2} Q${60 + HR * 0.65},${H + HR * 0.45} ${60 + HR * 0.5},${H + HR * 0.55}`}
          fill="#90CAF9" opacity="0.5" />
      </g>
    );
    if (isSick) return (
      <g>
        <circle cx="60" cy={H} r={HR} fill="rgba(100,200,100,0.08)" />
        <rect x="54" y={H - 14} width="12" height="7" rx="3" fill="#FFECB3" stroke="#FFD54F" strokeWidth="0.8" opacity="0.8" />
      </g>
    );
    if (isHungry) return (
      <path d={`M${60 + HR * 0.5},${H - HR * 0.3} Q${60 + HR * 0.6},${H - HR * 0.05} ${60 + HR * 0.48},${H}
        Q${60 + HR * 0.35},${H - HR * 0.12} ${60 + HR * 0.5},${H - HR * 0.3} Z`} fill="#90CAF9" opacity="0.5" />
    );
    return null;
  };

  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 120 160" style={{ animation: `${anim} ${isPlaying ? '0.8s' : '2.5s'} ease-in-out infinite` }}>
      <defs>
        <radialGradient id={`baby-head-${species}`} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor={c.primary} />
          <stop offset="100%" stopColor={c.secondary} />
        </radialGradient>
        <filter id="baby-shadow"><feGaussianBlur stdDeviation="2.5" /></filter>
      </defs>

      {/* Shadow */}
      <ellipse cx="60" cy="154" rx={BR + 8} ry="5" fill="rgba(0,0,0,0.06)" filter="url(#baby-shadow)" />

      {/* Tail */}
      {renderTail()}

      {/* Body */}
      {renderShell()}

      {/* Paws */}
      {renderPaws()}
      {renderBirdLegs()}
      {/* Waving paw for happy dog */}
      {species === 'cao' && isHappy && (
        <g style={{ transformOrigin: `${60 + 14}px ${BY + BRY - 3}px`, animation: `${pawWaveAnim} 0.6s ease-in-out infinite` }}>
          <ellipse cx={60 + 14} cy={BY + BRY - 12} rx="7" ry="5" fill={c.secondary} />
          <ellipse cx={60 + 14} cy={BY + BRY - 17} rx="5" ry="3" fill={c.primary} />
        </g>
      )}

      {/* HEAD - THE STAR */}
      <circle cx="60" cy={H} r={HR} fill={`url(#baby-head-${species})`} />
      {/* Head highlight for 3D */}
      <circle cx="54" cy={H - 10} r={HR * 0.35} fill="white" opacity="0.12" />

      {/* Ears */}
      {renderEars()}

      {/* Mood overlay */}
      {renderMoodOverlay()}

      {/* EYES - HUGE for babies */}
      {isSleeping ? (
        <g>
          <path d={`M${60 - 20},${H - 2} Q${60 - 12},${H - 8} ${60 - 4},${H - 2}`}
            stroke="#555" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d={`M${60 + 4},${H - 2} Q${60 + 12},${H - 8} ${60 + 20},${H - 2}`}
            stroke="#555" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <KawaiiEye cx={60 - 14} cy={H - 2} r={eyeR} closed={false} big={isExcited} irisColor={c.iris} mood={mood} />
          {mood === 'brincalhao' ? (
            <path d={`M${60 + 4},${H - 2} Q${60 + 14},${H - 9} ${60 + 20},${H - 2}`}
              stroke="#555" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : (
            <KawaiiEye cx={60 + 14} cy={H - 2} r={eyeR} closed={species === 'cao' && blinking} big={isExcited} irisColor={c.iris} mood={mood} />
          )}
          {/* Tongue for happy dog */}
          {isHappy && species === 'cao' && (
            <ellipse cx="60" cy={H + 15} rx="4" ry="5" fill="#F48FB1" />
          )}
        </g>
      )}

      {/* Nose */}
      {renderNose()}

      {/* Mouth */}
      {renderMouth()}

      {/* Whiskers */}
      {renderWhiskers()}

      {/* ALWAYS VISIBLE big rosy cheeks for babies */}
      <ellipse cx={60 - 28} cy={H + 5} rx="8" ry="5" fill="#FFB6C1" opacity={isPetting ? 0.85 : 0.55} />
      <ellipse cx={60 + 28} cy={H + 5} rx="8" ry="5" fill="#FFB6C1" opacity={isPetting ? 0.85 : 0.55} />

      {/* Tiny sparkle for all babies */}
      <text x="28" y="40" fontSize="14" opacity="0.5" style={{ animation: `${sparklePop} 2s ease-in-out infinite` }}>✨</text>
      <text x="82" y="55" fontSize="10" opacity="0.4" style={{ animation: `${sparklePop} 2.5s ease-in-out 0.8s infinite` }}>✨</text>
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// YOUNG (Stage 3) & ADULT (Stage 4) - Species SVGs
// ═══════════════════════════════════════════════════════════════════════════════

const YoungPetSVG = ({ species, mood, stage, size, interaction }) => {
  const c = speciesColors[species] || speciesColors.gato;
  const isAdult = stage === 4;
  const anim = getPetAnim(mood, interaction);
  const isPetting = interaction === 'pet';
  const isPlaying = interaction === 'play';
  const isHappy = mood === 'feliz' || mood === 'brincalhao';
  const isExcited = mood === 'energico' || isPlaying;
  const blinking = useBlink();

  const scl = isAdult ? 1.0 : 0.9;
  const HR = 28 * scl;
  const headY = 58 * scl;
  const bodyRx = 26 * scl;
  const bodyRy = isAdult ? 34 * scl : 26 * scl;
  const bodyY = 108 * scl;
  const eyeR = 7 * scl;
  const earH = 22 * scl;

  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 140 160" style={{ animation: `${anim} ${isPlaying ? '0.8s' : '2.5s'} ease-in-out infinite` }}>
      <defs>
        <radialGradient id={`young-head-${species}-${stage}`} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor={c.primary} />
          <stop offset="100%" stopColor={c.secondary} />
        </radialGradient>
        <filter id={`shadow-${stage}`}><feGaussianBlur stdDeviation="2.5" /></filter>
      </defs>

      {/* Shadow */}
      <ellipse cx="70" cy="152" rx={bodyRx + 6} ry="5" fill="rgba(0,0,0,0.06)" filter={`url(#shadow-${stage})`} />

      {/* Golden aura for adult */}
      {isAdult && (
        <ellipse cx="70" cy={(headY + bodyY) / 2} rx={bodyRx + 16} ry={(bodyRy + HR) / 2 + 16}
          fill="none" stroke="rgba(255,215,0,0.2)" strokeWidth="3"
          style={{ animation: `${goldenGlow} 2.5s ease-in-out infinite` }} />
      )}

      {/* Tail */}
      {species === 'gato' && (
        <path d={`M${70 + bodyRx * 0.9},${bodyY - bodyRy * 0.3} Q${70 + bodyRx * 1.5},${bodyY - bodyRy * 1.1} ${70 + bodyRx * 1.3},${bodyY - bodyRy * 1.5}`}
          stroke={c.dark} strokeWidth={isAdult ? 7 : 5} fill="none" strokeLinecap="round" />
      )}
      {species === 'cao' && (
        <g style={{ transformOrigin: `${70 + bodyRx * 0.85}px ${bodyY - bodyRy * 0.4}px`, animation: (isHappy || isPlaying) ? `${tailWag} 0.3s ease-in-out infinite` : 'none' }}>
          <path d={`M${70 + bodyRx * 0.85},${bodyY - bodyRy * 0.4} Q${70 + bodyRx * 1.5},${bodyY - bodyRy * 1.3} ${70 + bodyRx * 1.3},${bodyY - bodyRy * 1.7}`}
            stroke={c.dark} strokeWidth={isAdult ? 10 : 7} fill="none" strokeLinecap="round" />
          <path d={`M${70 + bodyRx * 0.85},${bodyY - bodyRy * 0.4} Q${70 + bodyRx * 1.5},${bodyY - bodyRy * 1.3} ${70 + bodyRx * 1.3},${bodyY - bodyRy * 1.7}`}
            stroke={c.primary} strokeWidth={isAdult ? 6 : 4} fill="none" strokeLinecap="round" />
        </g>
      )}
      {species === 'passaro' && (
        <g style={{ animation: isExcited ? `${wingFlap} 0.35s ease-in-out infinite` : 'none' }}>
          <ellipse cx={70 - bodyRx - 5} cy={bodyY - 12} rx={12 * scl} ry={18 * scl} fill={c.secondary} transform="rotate(-20,25,96)" />
          <ellipse cx={70 + bodyRx + 5} cy={bodyY - 12} rx={12 * scl} ry={18 * scl} fill={c.secondary} transform="rotate(20,115,96)" />
        </g>
      )}

      {/* Body */}
      {species === 'tartaruga' ? (
        <g>
          <ellipse cx="70" cy={bodyY} rx={bodyRx + 4} ry={bodyRy + 2} fill={c.secondary} />
          <ellipse cx="70" cy={bodyY} rx={bodyRx} ry={bodyRy} fill={c.primary} />
          <ellipse cx="70" cy={bodyY + 2} rx={bodyRx - 8} ry={bodyRy - 5} fill={c.accent} opacity="0.5" />
          {/* Shell pattern */}
          {[...Array(6)].map((_, i) => (
            <circle key={i} cx={70 + (Math.cos(i * 60) * bodyRx * 0.5)} cy={bodyY + (Math.sin(i * 60) * bodyRy * 0.5)}
              r={3 * scl} fill={c.accent} opacity="0.4" />
          ))}
          {isAdult && <circle cx="70" cy={bodyY} r={4 * scl} fill="#FFD700" opacity="0.3" />}
        </g>
      ) : (
        <g>
          <ellipse cx="70" cy={bodyY} rx={bodyRx} ry={bodyRy} fill={c.primary} />
          <ellipse cx="70" cy={bodyY + 3} rx={bodyRx - 7} ry={bodyRy - 5} fill={c.belly} />
        </g>
      )}

      {/* Paws / Legs */}
      {species === 'passaro' ? (
        <g>
          <line x1={70 - 10} y1={bodyY + bodyRy - 4} x2={70 - 12} y2={bodyY + bodyRy + 12} stroke={c.nose} strokeWidth="3" strokeLinecap="round" />
          <line x1={70 + 10} y1={bodyY + bodyRy - 4} x2={70 + 12} y2={bodyY + bodyRy + 12} stroke={c.nose} strokeWidth="3" strokeLinecap="round" />
          <path d={`M${70 - 18},${bodyY + bodyRy + 12} L${70 - 12},${bodyY + bodyRy + 12} L${70 - 6},${bodyY + bodyRy + 12}`} stroke={c.nose} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d={`M${70 + 6},${bodyY + bodyRy + 12} L${70 + 12},${bodyY + bodyRy + 12} L${70 + 18},${bodyY + bodyRy + 12}`} stroke={c.nose} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      ) : species === 'tartaruga' ? (
        <g>
          <ellipse cx={70 - 20} cy={bodyY + bodyRy} rx="8" ry="6" fill={c.primary} stroke={c.secondary} strokeWidth="1" />
          <ellipse cx={70 + 20} cy={bodyY + bodyRy} rx="8" ry="6" fill={c.primary} stroke={c.secondary} strokeWidth="1" />
          <ellipse cx={70 - 8} cy={bodyY + bodyRy + 2} rx="7" ry="5" fill={c.primary} stroke={c.secondary} strokeWidth="1" />
          <ellipse cx={70 + 8} cy={bodyY + bodyRy + 2} rx="7" ry="5" fill={c.primary} stroke={c.secondary} strokeWidth="1" />
        </g>
      ) : (
        <g>
          <ellipse cx={70 - bodyRx * 0.4} cy={bodyY + bodyRy - 3} rx={8 * scl} ry="5" fill={c.secondary} />
          <ellipse cx={70 + bodyRx * 0.4} cy={bodyY + bodyRy - 3} rx={8 * scl} ry="5" fill={c.secondary} />
        </g>
      )}
      {/* Waving paw for happy dog */}
      {species === 'cao' && (isHappy || isExcited) && (
        <g style={{ transformOrigin: `${70 + bodyRx * 0.4}px ${bodyY + bodyRy - 3}px`, animation: `${pawWaveAnim} 0.6s ease-in-out infinite` }}>
          <ellipse cx={70 + bodyRx * 0.4} cy={bodyY + bodyRy - 12} rx={7 * scl} ry="5" fill={c.secondary} />
          <ellipse cx={70 + bodyRx * 0.4} cy={bodyY + bodyRy - 17} rx={5 * scl} ry="3" fill={c.primary} />
        </g>
      )}

      {/* Head */}
      <circle cx="70" cy={headY} r={HR} fill={`url(#young-head-${species}-${stage})`} />
      <circle cx="65" cy={headY - HR * 0.2} r={HR * 0.3} fill="white" opacity="0.1" />

      {/* Ears */}
      {species === 'gato' && (
        <g>
          <polygon points={`${70 - HR * 0.7},${headY - HR * 0.5} ${70 - HR * 0.85},${headY - HR * 0.5 - earH} ${70 - HR * 0.2},${headY - HR * 0.7}`} fill={c.primary} />
          <polygon points={`${70 + HR * 0.7},${headY - HR * 0.5} ${70 + HR * 0.85},${headY - HR * 0.5 - earH} ${70 + HR * 0.2},${headY - HR * 0.7}`} fill={c.primary} />
          <polygon points={`${70 - HR * 0.62},${headY - HR * 0.48} ${70 - HR * 0.78},${headY - HR * 0.5 - (earH - 4)} ${70 - HR * 0.3},${headY - HR * 0.65}`} fill="#FFB6C1" />
          <polygon points={`${70 + HR * 0.62},${headY - HR * 0.48} ${70 + HR * 0.78},${headY - HR * 0.5 - (earH - 4)} ${70 + HR * 0.3},${headY - HR * 0.65}`} fill="#FFB6C1" />
        </g>
      )}
      {species === 'cao' && (
        <g>
          <ellipse cx={70 - HR * 0.8} cy={headY + 2} rx={11 * scl} ry={20 * scl} fill={c.secondary} transform={`rotate(18,${70 - HR * 0.8},${headY + 2})`} />
          <ellipse cx={70 + HR * 0.8} cy={headY + 2} rx={11 * scl} ry={20 * scl} fill={c.secondary} transform={`rotate(-18,${70 + HR * 0.8},${headY + 2})`} />
          <ellipse cx={70 - HR * 0.74} cy={headY + 4} rx={7 * scl} ry={14 * scl} fill="#FFB6C1" transform={`rotate(18,${70 - HR * 0.74},${headY + 4})`} />
          <ellipse cx={70 + HR * 0.74} cy={headY + 4} rx={7 * scl} ry={14 * scl} fill="#FFB6C1" transform={`rotate(-18,${70 + HR * 0.74},${headY + 4})`} />
        </g>
      )}
      {species === 'passaro' && (
        <g>
          <ellipse cx={70 - 12} cy={headY - HR + 8} rx={6} ry={12} fill={c.secondary} transform="rotate(-15,58,66)" />
          <ellipse cx={70 + 12} cy={headY - HR + 8} rx={6} ry={12} fill={c.secondary} transform="rotate(15,82,66)" />
          <ellipse cx={70 - 10} cy={headY - HR + 10} rx={3.5} ry={8} fill={c.inner} transform="rotate(-15,60,68)" />
          <ellipse cx={70 + 10} cy={headY - HR + 10} rx={3.5} ry={8} fill={c.inner} transform="rotate(15,80,68)" />
        </g>
      )}

      {/* Mood overlays */}
      {mood === 'triste' && (
        <g>
          <circle cx="70" cy={headY} r={HR} fill="rgba(0,0,0,0.05)" />
          <path d={`M${70 + HR * 0.45},${headY + HR * 0.15} Q${70 + HR * 0.55},${headY + HR * 0.5} ${70 + HR * 0.4},${headY + HR * 0.6}`}
            fill="#90CAF9" opacity="0.5" />
        </g>
      )}
      {mood === 'doente' && (
        <g>
          <circle cx="70" cy={headY} r={HR} fill="rgba(100,200,100,0.08)" />
          <rect x="66" y={headY - 10} width="8" height="5" rx="2" fill="#FFECB3" stroke="#FFD54F" strokeWidth="0.7" />
        </g>
      )}

      {/* Eyes */}
      {mood === 'sonolento' ? (
        <g>
          <path d={`M${70 - HR * 0.4 * scl},${headY - 2 * scl} Q${70 - HR * 0.2 * scl},${headY - 6 * scl} ${70 - HR * 0.02 * scl},${headY - 2 * scl}`}
            stroke="#555" strokeWidth={2.2} fill="none" strokeLinecap="round" />
          <path d={`M${70 + HR * 0.02 * scl},${headY - 2 * scl} Q${70 + HR * 0.2 * scl},${headY - 6 * scl} ${70 + HR * 0.4 * scl},${headY - 2 * scl}`}
            stroke="#555" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <KawaiiEye cx={70 - 14} cy={headY - 2} r={eyeR} closed={false} big={isExcited} irisColor={c.iris} mood={mood} />
          <KawaiiEye cx={70 + 14} cy={headY - 2} r={eyeR} closed={species === 'cao' && blinking} big={isExcited} irisColor={c.iris} mood={mood} />
        </g>
      )}

      {/* Nose */}
      {species === 'gato' && <path d={`M${70 - 2 * scl},${headY + 4} L70,${headY + 7} L${70 + 2 * scl},${headY + 4} Z`} fill={c.nose} />}
      {species === 'cao' && <ellipse cx="70" cy={headY + 4} rx="4" ry="3" fill={c.nose} />}
      {species === 'passaro' && (
        <g>
          <path d={`M${70 - 3},${headY + 3} L70,${headY + 9} L${70 + 3},${headY + 3} Z`} fill={c.nose} />
          {isHappy && <path d={`M${70 - 5},${headY + 10} L60,${headY + 14} L${70 + 5},${headY + 10}`} stroke={c.nose} strokeWidth="1.5" fill="none" />}
        </g>
      )}
      {species === 'tartaruga' && <circle cx="70" cy={headY + 5} r="1.5" fill={c.nose} />}

      {/* Mouth */}
      {mood === 'triste' ? (
        <path d={`M${70 - 8 * scl},${headY + 12} Q70,${headY + 7 * scl} ${70 + 8 * scl},${headY + 12}`} stroke="#555" strokeWidth="1.3" fill="none" />
      ) : mood === 'com_fome' ? (
        <ellipse cx="70" cy={headY + 11} rx="4" ry="3.5" fill="#888" />
      ) : mood === 'doente' ? (
        <path d={`M${70 - 6 * scl},${headY + 11} Q70,${headY + 15} ${70 + 6 * scl},${headY + 11}`} stroke="#888" strokeWidth="1.3" fill="none" strokeDasharray="2 2" />
      ) : species === 'cao' || species === 'passaro' ? (
        <path d={`M${70 - 7 * scl},${headY + 8} Q70,${headY + 13} ${70 + 7 * scl},${headY + 8}`} stroke="#555" strokeWidth="1.3" fill="none" />
      ) : (
        <path d={`M${70 - 7 * scl},${headY + 8} Q${70 - 3 * scl},${headY + 13} 70,${headY + 10} Q${70 + 3 * scl},${headY + 13} ${70 + 7 * scl},${headY + 8}`} stroke="#555" strokeWidth="1.3" fill="none" />
      )}

      {/* Tongue for dog */}
      {isHappy && species === 'cao' && <ellipse cx="70" cy={headY + 14} rx="5" ry="6" fill="#F48FB1" />}

      {/* Whiskers for cat */}
      {species === 'gato' && (
        <g>
          <line x1={70 - HR * 0.95} y1={headY + 3} x2={70 - HR * 0.42} y2={headY + 6} stroke="#ccc" strokeWidth="0.7" />
          <line x1={70 - HR} y1={headY + 8} x2={70 - HR * 0.4} y2={headY + 9} stroke="#ccc" strokeWidth="0.7" />
          <line x1={70 + HR * 0.42} y1={headY + 6} x2={70 + HR * 0.95} y2={headY + 3} stroke="#ccc" strokeWidth="0.7" />
          <line x1={70 + HR * 0.4} y1={headY + 9} x2={70 + HR} y2={headY + 8} stroke="#ccc" strokeWidth="0.7" />
        </g>
      )}

      {/* Cheeks */}
      <ellipse cx={70 - HR * 0.5} cy={headY + 5} rx="6" ry="4" fill="#FFB6C1" opacity={isPetting ? 0.8 : 0.45} />
      <ellipse cx={70 + HR * 0.5} cy={headY + 5} rx="6" ry="4" fill="#FFB6C1" opacity={isPetting ? 0.8 : 0.45} />

      {/* Crown */}
      {isAdult && <Crown x={57} y={headY - HR * 0.5 - earH - 14} s={0.85} />}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SPEECH BUBBLE
// ═══════════════════════════════════════════════════════════════════════════════

const SpeechBubble = ({ text }) => {
  if (!text) return null;
  return (
    <Box sx={{
      position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
      bgcolor: 'white', borderRadius: 3, px: 1.5, py: 0.5, boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      zIndex: 20, animation: `${floatAnim} 3s ease-in-out infinite`
    }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#555', whiteSpace: 'nowrap' }}>{text}</Typography>
      <Box sx={{
        position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
        width: 10, height: 10, bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }} />
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const PetAnimation = ({
  species = 'gato',
  mood = 'feliz',
  evolutionStage = 1,
  size = 180,
  excited = false,
  interaction = null,
}) => {
  const [hearts, setHearts] = useState(false);
  const [sparkles, setSparkles] = useState(false);
  const [blush, setBlush] = useState(false);
  const [food, setFood] = useState(false);
  const [stars, setStars] = useState(false);
  const [showSpeech, setShowSpeech] = useState(false);

  const stage = evolutionStage || 1;
  const speechTexts = {
    1: 'Alimenta-me! 🍼',
    2: 'Brinca comigo! 🎉',
    3: 'Vou crescer! 💪',
    4: 'Obrigado! 👑',
  };

  useEffect(() => {
    if (interaction === 'feed') {
      setFood(true); setHearts(true); setShowSpeech(true);
      const t = setTimeout(() => { setFood(false); setHearts(false); setShowSpeech(false); }, 2000);
      return () => clearTimeout(t);
    }
    if (interaction === 'pet') {
      setHearts(true); setBlush(true);
      const t = setTimeout(() => { setHearts(false); setBlush(false); }, 1500);
      return () => clearTimeout(t);
    }
    if (interaction === 'play') {
      setStars(true); setSparkles(true);
      const t = setTimeout(() => { setStars(false); setSparkles(false); }, 1800);
      return () => clearTimeout(t);
    }
  }, [interaction]);

  useEffect(() => {
    if (excited) {
      setSparkles(true); setHearts(true);
      const t = setTimeout(() => { setSparkles(false); setHearts(false); }, 2000);
      return () => clearTimeout(t);
    }
  }, [excited]);

  useEffect(() => {
    setShowSpeech(true);
    const t = setTimeout(() => setShowSpeech(false), 3000);
    return () => clearTimeout(t);
  }, [stage]);

  const renderPet = () => {
    if (stage === 1) return <EggSVG species={species} mood={mood} size={size} interaction={interaction} />;
    if (stage === 2) return <BabyPetSVG species={species} mood={mood} size={size} interaction={interaction} />;
    return <YoungPetSVG species={species} mood={mood} stage={stage} size={size} interaction={interaction} />;
  };

  return (
    <Box sx={{
      position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: stage === 2 ? size * 1.1 : size * 1.1, cursor: 'pointer',
      animation: `${stage >= 3 ? 'glowAnim' : 'none'} 4s ease-in-out infinite`
    }}>
      <HeartParticles show={hearts} />
      <FoodParticles show={food} />
      <StarBurst show={stars} />
      <SparkleEffect show={sparkles || (stage === 2)} />
      <ZzzEffect show={mood === 'sonolento'} />
      <BlushEffect show={blush} />
      {showSpeech && <SpeechBubble text={speechTexts[stage]} />}
      {renderPet()}
    </Box>
  );
};

export default PetAnimation;
