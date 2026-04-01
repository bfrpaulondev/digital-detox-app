import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, keyframes } from '@mui/material';

// ─── Keyframe Animations ──────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

const stageDescriptions = {
  1: 'Sou um ovinho! Alimenta-me para eu eclodir!',
  2: 'Olá! Acabei de nascer! Brinca comigo!',
  3: 'Estou a crescer! Quero ser forte!',
  4: 'Sou adulto agora! Obrigado por cuidares de mim!'
};

const stageNames = { 1: 'Ovo', 2: 'Bebé', 3: 'Jovem', 4: 'Adulto' };

const moodAnimations = {
  feliz: floatAnim,
  triste: sleepAnim,
  sonolento: sleepAnim,
  energico: excitedAnim,
  com_fome: wobbleAnim,
  brincalhao: bounceAnim,
  doente: wobbleAnim
};

const speciesColors = {
  gato: { primary: '#FF9800', secondary: '#F57C00', accent: '#FFE0B2', nose: '#E91E63', inner: '#FFCCBC' },
  cao: { primary: '#8D6E63', secondary: '#6D4C41', accent: '#D7CCC8', nose: '#4E342E', inner: '#FFCCBC' },
  passaro: { primary: '#42A5F5', secondary: '#1E88E5', accent: '#BBDEFB', nose: '#FF9800', inner: '#FFE082' },
  tartaruga: { primary: '#66BB6A', secondary: '#43A047', accent: '#A5D6A7', nose: '#2E7D32', inner: '#C8E6C9' }
};

const sizeScales = { 1: 1.0, 2: 0.65, 3: 0.82, 4: 1.0 };

// ─── Particle Effect Components ──────────────────────────────────────────────

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
    { left: '28%', delay: '0s', size: 22 },
    { left: '50%', delay: '0.12s', size: 26 },
    { left: '72%', delay: '0.24s', size: 20 },
    { left: '38%', delay: '0.36s', size: 24 },
    { left: '62%', delay: '0.18s', size: 22 },
    { left: '20%', delay: '0.3s', size: 18 },
    { left: '80%', delay: '0.08s', size: 18 }
  ];
  return (
    <Box sx={{ position: 'absolute', top: '15%', left: 0, right: 0, pointerEvents: 'none', zIndex: 10 }}>
      {hearts.map((h, i) => (
        <Box key={i} sx={{
          position: 'absolute', left: h.left, fontSize: h.size, color: '#E91E63',
          animation: `${heartFloat} 1.1s ease-out ${h.delay} forwards`,
          filter: 'drop-shadow(0 0 3px rgba(233,30,99,0.4))'
        }}>
          {'❤️'}
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
          position: 'absolute', left: d.left, top: d.top, fontSize: 16,
          animation: `${starBurst} 0.9s ease-out ${d.delay} forwards`,
          '--tx': d['--tx'], '--ty': d['--ty']
        }}>
          {'⭐'}
        </Box>
      ))}
    </Box>
  );
};

const SparkleEffect = ({ show }) => {
  const sparkles = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    top: `${8 + ((i * 37) % 84)}%`,
    left: `${8 + ((i * 43) % 84)}%`,
    delay: `${(i * 0.13) % 0.8}s`,
    size: 7 + ((i * 3) % 7),
    emoji: i % 3 === 0 ? '✨' : i % 3 === 1 ? '💫' : '⭐'
  })), []);
  if (!show) return null;
  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
      {sparkles.map((s, i) => (
        <Box key={i} sx={{
          position: 'absolute', top: s.top, left: s.left, fontSize: s.size,
          animation: `${sparkleAnim} 1s ease-in-out ${s.delay} infinite`
        }}>
          {s.emoji}
        </Box>
      ))}
    </Box>
  );
};

const ZzzEffect = ({ show }) => {
  if (!show) return null;
  return (
    <Box sx={{ position: 'absolute', top: '5%', right: '10%', pointerEvents: 'none', zIndex: 10 }}>
      {[0, 1, 2].map(i => (
        <Typography key={i} sx={{
          position: 'absolute', top: i * 14, right: i * 10,
          fontSize: 11 + i * 5, fontWeight: 700, color: '#9C27B0',
          animation: `${zzzAnim} 2.2s ease-in-out ${i * 0.55}s infinite`,
          fontFamily: 'monospace', opacity: 0.8
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
        position: 'absolute', top: '38%', left: '22%', width: 28, height: 16,
        borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(244,143,177,0.65) 0%, rgba(244,143,177,0) 70%)',
        animation: `${blushPop} 0.5s ease-out forwards`
      }} />
      <Box sx={{
        position: 'absolute', top: '38%', right: '22%', width: 28, height: 16,
        borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(244,143,177,0.65) 0%, rgba(244,143,177,0) 70%)',
        animation: `${blushPop} 0.5s ease-out 0.1s forwards`
      }} />
    </Box>
  );
};

// ─── Helper: Kawaii Eye Component ─────────────────────────────────────────────

const KawaiiEye = ({ cx, cy, r, closed, big, scl }) => {
  if (closed) {
    return (
      <g>
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#333" strokeWidth={scl * 2.5} strokeLinecap="round" />
      </g>
    );
  }
  const eyeR = big ? r * 1.3 : r;
  const pupilR = eyeR * 0.65;
  return (
    <g>
      <circle cx={cx} cy={cy} r={eyeR} fill="white" stroke="#333" strokeWidth={scl * 0.8} />
      <circle cx={cx + scl * 1} cy={cy + scl * 0.5} r={pupilR} fill="#333" />
      <circle cx={cx - scl * 1.5} cy={cy - scl * 1.5} r={pupilR * 0.45} fill="white" />
      <circle cx={cx + scl * 1.8} cy={cy + scl * 1} r={pupilR * 0.22} fill="white" />
    </g>
  );
};

// ─── Helper: Crown ────────────────────────────────────────────────────────────

const Crown = ({ x, y, scl, ornate }) => (
  <g transform={`translate(${x}, ${y}) scale(${scl})`}>
    <polygon points="15,0 0,14 5,6 3,18 15,9 27,18 25,6 30,14" fill="#FFD700" stroke="#DAA520" strokeWidth="1.2" />
    <circle cx="8" cy="7" r={ornate ? 2.5 : 2} fill="#E91E63" />
    <circle cx="15" cy="3" r={ornate ? 2.5 : 2} fill="#2196F3" />
    <circle cx="22" cy="7" r={ornate ? 2.5 : 2} fill="#4CAF50" />
    {ornate && <circle cx="15" cy="10" r={1.8} fill="#FF9800" />}
    {ornate && <line x1="15" y1="0" x2="15" y2="-5" stroke="#FFD700" strokeWidth="1.5" />}
    {ornate && <circle cx="15" cy="-6" r="2.5" fill="#FFD700" stroke="#DAA520" strokeWidth="0.8" />}
  </g>
);

// ─── EGG SVG (Stage 1) ───────────────────────────────────────────────────────

const EggSVG = ({ species, mood, size, interaction }) => {
  const colors = speciesColors[species] || speciesColors.gato;
  const baseAnim = mood === 'energico' ? bounceAnim : moodAnimations[mood] || wobbleAnim;
  const isEating = interaction === 'feed';
  const anim = isEating ? eatAnim : baseAnim;
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 120 150" style={{ animation: `${anim} 3s ease-in-out infinite` }}>
      {/* Shadow */}
      <ellipse cx="60" cy="142" rx="38" ry="6" fill="rgba(0,0,0,0.1)" />
      {/* Egg body with gradient layers */}
      <ellipse cx="60" cy="72" rx="48" ry="60" fill={colors.secondary} />
      <ellipse cx="60" cy="72" rx="45" ry="57" fill={colors.primary} />
      <ellipse cx="56" cy="68" rx="38" ry="48" fill={colors.accent} opacity="0.7" />
      {/* Colorful speckled pattern */}
      <circle cx="38" cy="42" r="5" fill={colors.secondary} opacity="0.5" />
      <circle cx="78" cy="50" r="4" fill={colors.secondary} opacity="0.45" />
      <circle cx="50" cy="85" r="5.5" fill={colors.secondary} opacity="0.4" />
      <circle cx="72" cy="78" r="3.5" fill={colors.secondary} opacity="0.5" />
      <circle cx="42" cy="65" r="3" fill={colors.secondary} opacity="0.35" />
      <circle cx="80" cy="70" r="4" fill={colors.secondary} opacity="0.3" />
      <circle cx="55" cy="100" r="3" fill={colors.secondary} opacity="0.35" />
      {/* Shine / highlight */}
      <ellipse cx="46" cy="45" rx="14" ry="24" fill="white" opacity="0.22" />
      <ellipse cx="44" cy="40" rx="7" ry="12" fill="white" opacity="0.18" style={{ animation: `${shimmerAnim} 2.5s ease-in-out infinite` }} />
      {/* Crack lines for energico mood */}
      {mood === 'energico' && (
        <g>
          <path d="M54 22 L57 38 L49 48 L58 56 L54 65" stroke={colors.secondary} strokeWidth="2.5" fill="none" opacity="0.8" />
          <path d="M57 38 L67 33" stroke={colors.secondary} strokeWidth="1.8" fill="none" opacity="0.7" />
          <path d="M49 48 L42 45" stroke={colors.secondary} strokeWidth="1.5" fill="none" opacity="0.6" />
        </g>
      )}
      {/* Cute face peeking through */}
      {mood === 'sonolento' ? (
        <g>
          <line x1="47" y1="62" x2="56" y2="62" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="66" y1="62" x2="75" y2="62" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M56 74 Q61 71 66 74" stroke="#333" strokeWidth="1.5" fill="none" />
        </g>
      ) : (
        <g>
          <circle cx="51" cy="62" r="4.5" fill="white" stroke="#444" strokeWidth="0.8" />
          <circle cx="70" cy="62" r="4.5" fill="white" stroke="#444" strokeWidth="0.8" />
          <circle cx="52.5" cy="63" r="2.8" fill="#333" />
          <circle cx="71.5" cy="63" r="2.8" fill="#333" />
          <circle cx="50.5" cy="61" r="1.2" fill="white" />
          <circle cx="69.5" cy="61" r="1.2" fill="white" />
          {/* Mouth expressions */}
          {mood === 'feliz' && <path d="M55 73 Q61 79 67 73" stroke="#333" strokeWidth="1.8" fill="none" />}
          {mood === 'com_fome' && <ellipse cx="61" cy="74" rx="5" ry="4" fill="#555" />}
          {mood === 'triste' && <path d="M55 77 Q61 71 67 77" stroke="#333" strokeWidth="1.8" fill="none" />}
          {mood === 'brincalhao' && <circle cx="61" cy="75" r="3" fill="#555" />}
          {mood === 'doente' && <path d="M55 76 Q61 80 67 76" stroke="#333" strokeWidth="1.5" fill="none" strokeDasharray="2 2" />}
        </g>
      )}
      {/* Blush cheeks */}
      <ellipse cx="44" cy="70" rx="5" ry="3" fill="#FFAB91" opacity="0.4" />
      <ellipse cx="77" cy="70" rx="5" ry="3" fill="#FFAB91" opacity="0.4" />
    </svg>
  );
};

// ─── CAT SVG (Stages 2-4) ─────────────────────────────────────────────────────

const CatSVG = ({ species, mood, stage, size, interaction }) => {
  const colors = speciesColors[species] || speciesColors.gato;
  const scl = sizeScales[stage] || 1;
  const isEating = interaction === 'feed';
  const isPetting = interaction === 'pet';
  const isPlaying = interaction === 'play';
  const anim = isPlaying ? excitedAnim : isEating ? eatAnim : moodAnimations[mood] || floatAnim;
  const isChibi = stage === 2;
  const isAdult = stage === 4;

  // Proportions per stage
  const headR = isChibi ? 34 : isAdult ? 30 : 31;
  const bodyRx = isChibi ? 24 : isAdult ? 30 : 27;
  const bodyRy = isChibi ? 20 : isAdult ? 36 : 28;
  const bodyCy = isChibi ? 100 : 108;
  const headCy = isChibi ? 52 : 56;
  const eyeR = isChibi ? 6.5 : isAdult ? 5.5 : 6;
  const earH = isChibi ? 22 : isAdult ? 20 : 21;
  // ── BABY (CHIBI) CAT ──────────────────────────────────────
  if (isChibi) {
    const cH = 28 * scl;
    const cBx = 26 * scl;
    const cBy = 24 * scl;
    const cEy = 8 * scl;
    const cHcy = 54 * scl;
    const cBcy = 100 * scl;

    return (
      <svg width={size} height={size * 1.15} viewBox="0 0 140 160" style={{ animation: `${anim} ${isPlaying ? '1s' : '2.5s'} ease-in-out infinite` }}>
        {/* Shadow */}
        <ellipse cx="70" cy="152" rx={cBx + 4} ry="5" fill="rgba(0,0,0,0.08)" />

        {/* Floating sparkles - always around baby */}
        <g style={{ animation: `${sparkleAnim} 1.8s ease-in-out 0s infinite`, transformOrigin: '28px 35px' }}>
          <path d={`M28,35 ${star_path}`} transform="translate(28,35)" fill="#FFD700" opacity="0.8" />
        </g>
        <g style={{ animation: `${sparkleAnim} 2.2s ease-in-out 0.5s infinite`, transformOrigin: '112px 50px' }}>
          <path d={`M112,50 ${star_path}`} transform="translate(112,50) scale(0.7)" fill="#FF9800" opacity="0.7" />
        </g>
        <g style={{ animation: `${sparkleAnim} 2s ease-in-out 1s infinite`, transformOrigin: '32px 120px' }}>
          <path d={`M32,120 ${star_path}`} transform="translate(32,120) scale(0.6)" fill="#FFEB3B" opacity="0.65" />
        </g>

        {/* Short stubby tail */}
        <path
          d={`M${70 + cBx * 0.85} ${cBcy - cBy * 0.3} Q${70 + cBx * 1.25} ${cBcy - cBy * 0.65} ${70 + cBx * 1.1} ${cBcy - cBy * 0.85}`}
          stroke={colors.secondary} strokeWidth={scl * 5} fill="none" strokeLinecap="round"
        />

        {/* Round mochi body */}
        <ellipse cx="70" cy={cBcy} rx={cBx} ry={cBy} fill={colors.primary} />
        {/* Belly */}
        <ellipse cx="70" cy={cBcy + 2} rx={cBx - 9} ry={cBy - 7} fill={colors.accent} />

        {/* Tiny paws barely visible */}
        <ellipse cx={70 - cBx * 0.35} cy={cBcy + cBy - 2} rx={5 * scl} ry={3 * scl} fill={colors.secondary} />
        <ellipse cx={70 + cBx * 0.35} cy={cBcy + cBy - 2} rx={5 * scl} ry={3 * scl} fill={colors.secondary} />
        {/* Paw pads */}
        <ellipse cx={70 - cBx * 0.35} cy={cBcy + cBy} rx={2.5 * scl} ry={1.5 * scl} fill={colors.inner} />
        <ellipse cx={70 + cBx * 0.35} cy={cBcy + cBy} rx={2.5 * scl} ry={1.5 * scl} fill={colors.inner} />

        {/* Big chibi head */}
        <circle cx="70" cy={cHcy} r={cH} fill={colors.primary} />
        {/* Head highlight */}
        <circle cx="66" cy={cHcy - cH * 0.15} r={cH * 0.45} fill="white" opacity="0.12" />

        {/* Small rounded ears */}
        <ellipse cx={70 - cH * 0.55} cy={cHcy - cH * 0.72} rx={7 * scl} ry={9 * scl} fill={colors.primary} transform={`rotate(-12, ${70 - cH * 0.55}, ${cHcy - cH * 0.72})`} />
        <ellipse cx={70 + cH * 0.55} cy={cHcy - cH * 0.72} rx={7 * scl} ry={9 * scl} fill={colors.primary} transform={`rotate(12, ${70 + cH * 0.55}, ${cHcy - cH * 0.72})`} />
        {/* Inner ears */}
        <ellipse cx={70 - cH * 0.5} cy={cHcy - cH * 0.67} rx={4 * scl} ry={5.5 * scl} fill={colors.inner} transform={`rotate(-12, ${70 - cH * 0.5}, ${cHcy - cH * 0.67})`} />
        <ellipse cx={70 + cH * 0.5} cy={cHcy - cH * 0.67} rx={4 * scl} ry={5.5 * scl} fill={colors.inner} transform={`rotate(12, ${70 + cH * 0.5}, ${cHcy - cH * 0.67})`} />

        {/* Giant kawaii eyes */}
        {mood === 'sonolento' ? (
          <g>
            <line x1={70 - cH * 0.35} y1={cHcy - 2} x2={70 - cH * 0.08} y2={cHcy - 2} stroke="#333" strokeWidth={scl * 2.5} strokeLinecap="round" />
            <line x1={70 + cH * 0.08} y1={cHcy - 2} x2={70 + cH * 0.35} y2={cHcy - 2} stroke="#333" strokeWidth={scl * 2.5} strokeLinecap="round" />
          </g>
        ) : mood === 'brincalhao' ? (
          <g>
            <KawaiiEye cx={70 - cH * 0.22} cy={cHcy - 2} r={cEy} closed={false} big={mood === 'energico'} scl={scl} />
            <line x1={70 + cH * 0.08} y1={cHcy - 2} x2={70 + cH * 0.35} y2={cHcy - 2} stroke="#333" strokeWidth={scl * 2.5} strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <KawaiiEye cx={70 - cH * 0.22} cy={cHcy - 2} r={cEy} closed={false} big={mood === 'energico'} scl={scl} />
            <KawaiiEye cx={70 + cH * 0.22} cy={cHcy - 2} r={cEy} closed={false} big={mood === 'energico'} scl={scl} />
          </g>
        )}

        {/* Tiny nose */}
        <path d={`M${70 - 1.5 * scl} ${cHcy + 5} L70 ${cHcy + 7.5} L${70 + 1.5 * scl} ${cHcy + 5} Z`} fill={colors.nose} />

        {/* Mouth - ω default, mood overrides */}
        {mood === 'triste' ? (
          <path d={`M${70 - cH * 0.18} ${cHcy + 12} Q70 ${cHcy + 8} ${70 + cH * 0.18} ${cHcy + 12}`} stroke="#333" strokeWidth={scl * 1.2} fill="none" />
        ) : mood === 'com_fome' ? (
          <ellipse cx="70" cy={cHcy + 11} rx={3.5 * scl} ry={3 * scl} fill="#555" />
        ) : mood === 'doente' ? (
          <circle cx="70" cy={cHcy + 11} r={2.5 * scl} fill="#9C27B0" opacity="0.3" />
        ) : (
          /* ω mouth */
          <path d={`M${70 - cH * 0.14} ${cHcy + 9} Q${70 - cH * 0.05} ${cHcy + 13} 70 ${cHcy + 10} Q${70 + cH * 0.05} ${cHcy + 13} ${70 + cH * 0.14} ${cHcy + 9}`} stroke="#333" strokeWidth={scl * 1.2} fill="none" />
        )}

        {/* Short stubby whiskers */}
        <line x1={70 - cH * 0.52} y1={cHcy + 3} x2={70 - cH * 0.28} y2={cHcy + 5} stroke="#888" strokeWidth={scl * 0.7} />
        <line x1={70 - cH * 0.55} y1={cHcy + 7} x2={70 - cH * 0.28} y2={cHcy + 7} stroke="#888" strokeWidth={scl * 0.7} />
        <line x1={70 + cH * 0.28} y1={cHcy + 5} x2={70 + cH * 0.52} y2={cHcy + 3} stroke="#888" strokeWidth={scl * 0.7} />
        <line x1={70 + cH * 0.28} y1={cHcy + 7} x2={70 + cH * 0.55} y2={cHcy + 7} stroke="#888" strokeWidth={scl * 0.7} />

        {/* Always-visible rosy cheeks */}
        <ellipse cx={70 - cH * 0.42} cy={cHcy + 4} rx={5.5 * scl} ry={3.5 * scl} fill="#FFAB91" opacity={isPetting ? 0.85 : 0.65} />
        <ellipse cx={70 + cH * 0.42} cy={cHcy + 4} rx={5.5 * scl} ry={3.5 * scl} fill="#FFAB91" opacity={isPetting ? 0.85 : 0.65} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 140 160" style={{ animation: `${anim} ${isPlaying ? '1s' : '2.5s'} ease-in-out infinite` }}>
      {/* Shadow */}
      <ellipse cx="70" cy="152" rx={30 * scl} ry="5" fill="rgba(0,0,0,0.08)" />
      {/* Tail - fluffier */}
      <path
        d={`M${96 * scl} ${bodyCy - bodyRy * 0.4} Q${118 * scl} ${bodyCy - bodyRy * 1.2} ${112 * scl} ${bodyCy - bodyRy * 1.6} Q${106 * scl} ${bodyCy - bodyRy * 1.9} ${108 * scl} ${bodyCy - bodyRy * 2}`}
        stroke={colors.secondary} strokeWidth={scl * 7} fill="none" strokeLinecap="round"
        style={{ transformOrigin: `${96 * scl}px ${bodyCy - bodyRy * 0.4}px` }}
      />
      <path
        d={`M${96 * scl} ${bodyCy - bodyRy * 0.4} Q${118 * scl} ${bodyCy - bodyRy * 1.2} ${112 * scl} ${bodyCy - bodyRy * 1.6}`}
        stroke={colors.primary} strokeWidth={scl * 4} fill="none" strokeLinecap="round"
      />
      {/* Body */}
      <ellipse cx="70" cy={bodyCy} rx={bodyRx * scl} ry={bodyRy * scl} fill={colors.primary} />
      {/* Belly */}
      <ellipse cx="70" cy={bodyCy + 3} rx={(bodyRx - 8) * scl} ry={(bodyRy - 6) * scl} fill={colors.accent} />
      {/* Paws */}
      <ellipse cx={52 * scl} cy={bodyCy + bodyRy * scl - 2} rx={isChibi ? 9 * scl : 8 * scl} ry={5 * scl} fill={colors.secondary} />
      <ellipse cx={88 * scl} cy={bodyCy + bodyRy * scl - 2} rx={isChibi ? 9 * scl : 8 * scl} ry={5 * scl} fill={colors.secondary} />
      {/* Paw pads */}
      <ellipse cx={52 * scl} cy={bodyCy + bodyRy * scl} rx={4 * scl} ry={2.5 * scl} fill={colors.inner} />
      <ellipse cx={88 * scl} cy={bodyCy + bodyRy * scl} rx={4 * scl} ry={2.5 * scl} fill={colors.inner} />
      {/* Head */}
      <circle cx="70" cy={headCy} r={headR * scl} fill={colors.primary} />
      {/* Ears - pointed with inner detail */}
      <polygon
        points={`${70 - headR * 0.7 * scl},${headCy - headR * 0.6 * scl} ${70 - headR * 0.85 * scl},${headCy - headR * 0.6 * scl - earH * scl} ${70 - headR * 0.2 * scl},${headCy - headR * 0.75 * scl}`}
        fill={colors.primary}
      />
      <polygon
        points={`${70 + headR * 0.7 * scl},${headCy - headR * 0.6 * scl} ${70 + headR * 0.85 * scl},${headCy - headR * 0.6 * scl - earH * scl} ${70 + headR * 0.2 * scl},${headCy - headR * 0.75 * scl}`}
        fill={colors.primary}
      />
      {/* Inner ears */}
      <polygon
        points={`${70 - headR * 0.62 * scl},${headCy - headR * 0.58 * scl} ${70 - headR * 0.78 * scl},${headCy - headR * 0.6 * scl - (earH - 4) * scl} ${70 - headR * 0.3 * scl},${headCy - headR * 0.72 * scl}`}
        fill={colors.inner}
      />
      <polygon
        points={`${70 + headR * 0.62 * scl},${headCy - headR * 0.58 * scl} ${70 + headR * 0.78 * scl},${headCy - headR * 0.6 * scl - (earH - 4) * scl} ${70 + headR * 0.3 * scl},${headCy - headR * 0.72 * scl}`}
        fill={colors.inner}
      />
      {/* Face - Eyes */}
      {mood === 'sonolento' ? (
        <g>
          <line x1={`${59 * scl}`} y1={`${headCy - 3 * scl}`} x2={`${67 * scl}`} y2={`${headCy - 3 * scl}`} stroke="#333" strokeWidth={scl * 2.5} strokeLinecap="round" />
          <line x1={`${73 * scl}`} y1={`${headCy - 3 * scl}`} x2={`${81 * scl}`} y2={`${headCy - 3 * scl}`} stroke="#333" strokeWidth={scl * 2.5} strokeLinecap="round" />
        </g>
      ) : mood === 'brincalhao' ? (
        <g>
          <KawaiiEye cx={63 * scl} cy={headCy - 3 * scl} r={eyeR * scl} closed={false} big scl={scl} />
          <line x1={`${73 * scl}`} y1={`${headCy - 3 * scl}`} x2={`${81 * scl}`} y2={`${headCy - 3 * scl}`} stroke="#333" strokeWidth={scl * 2.5} strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <KawaiiEye cx={63 * scl} cy={headCy - 3 * scl} r={eyeR * scl} closed={false} big={mood === 'energico'} scl={scl} />
          <KawaiiEye cx={77 * scl} cy={headCy - 3 * scl} r={eyeR * scl} closed={false} big={mood === 'energico'} scl={scl} />
        </g>
      )}
      {/* Nose */}
      <path d={`M${67 * scl} ${headCy + 4 * scl} L${70 * scl} ${headCy + 7 * scl} L${73 * scl} ${headCy + 4 * scl} Z`} fill={colors.nose} />
      {/* Mouth */}
      <path d={`M${64 * scl} ${headCy + 8 * scl} Q${67 * scl} ${headCy + 12 * scl} ${70 * scl} ${headCy + 9 * scl} Q${73 * scl} ${headCy + 12 * scl} ${76 * scl} ${headCy + 8 * scl}`} stroke="#333" strokeWidth={scl * 1.3} fill="none" />
      {mood === 'com_fome' && <ellipse cx="70" cy={headCy + 11 * scl} rx={4 * scl} ry={3.5 * scl} fill="#E91E63" />}
      {mood === 'triste' && <path d={`M${64 * scl} ${headCy + 12 * scl} Q${70 * scl} ${headCy + 8 * scl} ${76 * scl} ${headCy + 12 * scl}`} stroke="#333" strokeWidth={scl * 1.3} fill="none" />}
      {mood === 'doente' && <circle cx="70" cy={headCy + 11 * scl} r={3 * scl} fill="#9C27B0" opacity="0.3" />}
      {/* Whiskers */}
      <line x1={`${32 * scl}`} y1={`${headCy + 1 * scl}`} x2={`${56 * scl}`} y2={`${headCy + 3 * scl}`} stroke="#888" strokeWidth={scl * 0.9} />
      <line x1={`${30 * scl}`} y1={`${headCy + 6 * scl}`} x2={`${55 * scl}`} y2={`${headCy + 6 * scl}`} stroke="#888" strokeWidth={scl * 0.9} />
      <line x1={`${84 * scl}`} y1={`${headCy + 3 * scl}`} x2={`${108 * scl}`} y2={`${headCy + 1 * scl}`} stroke="#888" strokeWidth={scl * 0.9} />
      <line x1={`${85 * scl}`} y1={`${headCy + 6 * scl}`} x2={`${110 * scl}`} y2={`${headCy + 6 * scl}`} stroke="#888" strokeWidth={scl * 0.9} />
      {/* Cheeks blush */}
      <ellipse cx={`${52 * scl}`} cy={`${headCy + 4 * scl}`} rx={5.5 * scl} ry={3.5 * scl} fill="#FFAB91" opacity={isPetting ? 0.75 : 0.45} />
      <ellipse cx={`${88 * scl}`} cy={`${headCy + 4 * scl}`} rx={5.5 * scl} ry={3.5 * scl} fill="#FFAB91" opacity={isPetting ? 0.75 : 0.45} />
      {/* Crown for adult */}
      {stage === 4 && <Crown x={55} y={headCy - headR * 0.6 * scl - earH * scl - 16} scl={0.9} ornate />}
      {/* Adult glow ring */}
      {stage === 4 && (
        <ellipse cx="70" cy={bodyCy} rx={bodyRx * scl + 8} ry={bodyRy * scl + 8}
          fill="none" stroke="rgba(255,215,0,0.15)" strokeWidth="3" style={{ animation: `${pulseAnim} 3s ease-in-out infinite` }} />
      )}
    </svg>
  );
};

// ─── DOG SVG (Stages 2-4) ────────────────────────────────────────────────────

const DogSVG = ({ species, mood, stage, size, interaction }) => {
  const colors = speciesColors[species] || speciesColors.cao;
  const scl = sizeScales[stage] || 1;
  const isEating = interaction === 'feed';
  const isPetting = interaction === 'pet';
  const isPlaying = interaction === 'play';
  const anim = isPlaying ? excitedAnim : isEating ? eatAnim : moodAnimations[mood] || floatAnim;
  const isChibi = stage === 2;
  const isAdult = stage === 4;

  const headR = isChibi ? 34 : isAdult ? 30 : 32;
  const bodyRx = isChibi ? 26 : isAdult ? 32 : 29;
  const bodyRy = isChibi ? 22 : isAdult ? 38 : 30;
  const bodyCy = isChibi ? 102 : 110;
  const headCy = isChibi ? 54 : 58;
  const eyeR = isChibi ? 6 : isAdult ? 5 : 5.5;
  // ── BABY (CHIBI) DOG ──────────────────────────────────────
  if (isChibi) {
    const cH = 30 * scl;
    const cBx = 28 * scl;
    const cBy = 26 * scl;
    const cEy = 8.5 * scl;
    const cHcy = 52 * scl;
    const cBcy = 102 * scl;

    return (
      <svg width={size} height={size * 1.15} viewBox="0 0 140 160" style={{ animation: `${anim} ${isPlaying ? '1s' : '2.5s'} ease-in-out infinite` }}>
        {/* Shadow */}
        <ellipse cx="70" cy="152" rx={cBx + 6} ry="5" fill="rgba(0,0,0,0.08)" />

        {/* Tiny heart floating above head */}
        <g style={{ animation: `${floatAnim} 2.5s ease-in-out 0s infinite` }}>
          <path d="M70,18 C67,14 62,14 62,18 C62,22 70,26 70,26 C70,26 78,22 78,18 C78,14 73,14 70,18 Z" fill="#E91E63" opacity="0.7" />
        </g>

        {/* Tiny tail nub */}
        <g style={{ transformOrigin: `${70 + cBx * 0.85}px ${cBcy - cBy * 0.4}px`, animation: (mood === 'feliz' || mood === 'brincalhao' || isPlaying) ? `${tailWag} 0.4s ease-in-out infinite` : 'none' }}>
          <path
            d={`M${70 + cBx * 0.85} ${cBcy - cBy * 0.4} Q${70 + cBx * 1.15} ${cBcy - cBy * 0.8} ${70 + cBx * 1.05} ${cBcy - cBy * 0.95}`}
            stroke={colors.secondary} strokeWidth={scl * 6} fill="none" strokeLinecap="round"
          />
        </g>

        {/* Chunky potato body */}
        <ellipse cx="70" cy={cBcy} rx={cBx} ry={cBy} fill={colors.primary} />
        {/* Belly */}
        <ellipse cx="70" cy={cBcy + 3} rx={cBx - 10} ry={cBy - 8} fill={colors.accent} />

        {/* Round pudgy paws */}
        <ellipse cx={70 - cBx * 0.4} cy={cBcy + cBy - 2} rx={6 * scl} ry={4 * scl} fill={colors.secondary} />
        <ellipse cx={70 + cBx * 0.4} cy={cBcy + cBy - 2} rx={6 * scl} ry={4 * scl} fill={colors.secondary} />
        {/* Toe lines */}
        <line x1={70 - cBx * 0.47} y1={cBcy + cBy} x2={70 - cBx * 0.47} y2={cBcy + cBy - 4} stroke={colors.secondary} strokeWidth={scl * 0.8} />
        <line x1={70 - cBx * 0.4} y1={cBcy + cBy} x2={70 - cBx * 0.4} y2={cBcy + cBy - 4} stroke={colors.secondary} strokeWidth={scl * 0.8} />
        <line x1={70 + cBx * 0.4} y1={cBcy + cBy} x2={70 + cBx * 0.4} y2={cBcy + cBy - 4} stroke={colors.secondary} strokeWidth={scl * 0.8} />
        <line x1={70 + cBx * 0.47} y1={cBcy + cBy} x2={70 + cBx * 0.47} y2={cBcy + cBy - 4} stroke={colors.secondary} strokeWidth={scl * 0.8} />

        {/* Big chibi head */}
        <circle cx="70" cy={cHcy} r={cH} fill={colors.primary} />
        {/* Forehead highlight */}
        <circle cx="66" cy={cHcy - cH * 0.2} r={cH * 0.4} fill="white" opacity="0.1" />

        {/* Extra floppy ears - almost covering head */}
        <ellipse cx={70 - cH * 0.82} cy={cHcy + 2 * scl} rx={10 * scl} ry={20 * scl} fill={colors.secondary} transform={`rotate(22, ${70 - cH * 0.82}, ${cHcy + 2 * scl})`} />
        <ellipse cx={70 + cH * 0.82} cy={cHcy + 2 * scl} rx={10 * scl} ry={20 * scl} fill={colors.secondary} transform={`rotate(-22, ${70 + cH * 0.82}, ${cHcy + 2 * scl})`} />
        {/* Inner ears */}
        <ellipse cx={70 - cH * 0.78} cy={cHcy + 4 * scl} rx={6 * scl} ry={14 * scl} fill={colors.inner} transform={`rotate(22, ${70 - cH * 0.78}, ${cHcy + 4 * scl})`} />
        <ellipse cx={70 + cH * 0.78} cy={cHcy + 4 * scl} rx={6 * scl} ry={14 * scl} fill={colors.inner} transform={`rotate(-22, ${70 + cH * 0.78}, ${cHcy + 4 * scl})`} />

        {/* Super big round puppy eyes */}
        {mood === 'sonolento' ? (
          <g>
            <line x1={70 - cH * 0.32} y1={cHcy - 3} x2={70 - cH * 0.08} y2={cHcy - 3} stroke="#333" strokeWidth={scl * 2.5} strokeLinecap="round" />
            <line x1={70 + cH * 0.08} y1={cHcy - 3} x2={70 + cH * 0.32} y2={cHcy - 3} stroke="#333" strokeWidth={scl * 2.5} strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <KawaiiEye cx={70 - cH * 0.2} cy={cHcy - 3} r={cEy} closed={false} big={mood === 'energico'} scl={scl} />
            <KawaiiEye cx={70 + cH * 0.2} cy={cHcy - 3} r={cEy} closed={false} big={mood === 'energico'} scl={scl} />
          </g>
        )}

        {/* Eyebrows for doente */}
        {mood === 'doente' && (
          <g>
            <line x1={70 - cH * 0.3} y1={cHcy - 11} x2={70 - cH * 0.1} y2={cHcy - 9} stroke="#555" strokeWidth={scl * 1.5} strokeLinecap="round" />
            <line x1={70 + cH * 0.1} y1={cHcy - 9} x2={70 + cH * 0.3} y2={cHcy - 11} stroke="#555" strokeWidth={scl * 1.5} strokeLinecap="round" />
          </g>
        )}

        {/* Nose */}
        <ellipse cx="70" cy={cHcy + 4 * scl} rx={4.5 * scl} ry={3 * scl} fill={colors.nose} />
        <ellipse cx="69" cy={cHcy + 3.5 * scl} rx={1.2 * scl} ry={0.8 * scl} fill="white" opacity="0.4" />

        {/* Mouth & always-sticking-out tongue */}
        {mood === 'triste' ? (
          <path d={`M${70 - cH * 0.12} ${cHcy + 13} Q70 ${cHcy + 9} ${70 + cH * 0.12} ${cHcy + 13}`} stroke="#333" strokeWidth={scl * 1.3} fill="none" />
        ) : mood === 'com_fome' ? (
          <g>
            <ellipse cx="70" cy={cHcy + 12} rx={4 * scl} ry={5 * scl} fill="#555" />
            <ellipse cx="70" cy={cHcy + 15} rx={3 * scl} ry={4 * scl} fill="#F48FB1" />
          </g>
        ) : (
          <g>
            <path d={`M${70 - cH * 0.12} ${cHcy + 7.5} Q70 ${cHcy + 11} ${70 + cH * 0.12} ${cHcy + 7.5}`} stroke="#333" strokeWidth={scl * 1.3} fill="none" />
            {/* Always tiny tongue sticking out */}
            <ellipse cx="70" cy={cHcy + 12} rx={3 * scl} ry={4 * scl} fill="#F48FB1" />
          </g>
        )}

        {/* Extra big rosy cheeks - always visible */}
        <ellipse cx={70 - cH * 0.38} cy={cHcy + 5} rx={6 * scl} ry={4 * scl} fill="#FFAB91" opacity={isPetting ? 0.9 : 0.7} />
        <ellipse cx={70 + cH * 0.38} cy={cHcy + 5} rx={6 * scl} ry={4 * scl} fill="#FFAB91" opacity={isPetting ? 0.9 : 0.7} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 140 160" style={{ animation: `${anim} ${isPlaying ? '1s' : '2.5s'} ease-in-out infinite` }}>
      {/* Shadow */}
      <ellipse cx="70" cy="152" rx={32 * scl} ry="5" fill="rgba(0,0,0,0.08)" />
      {/* Tail - fluffy, wagging for feliz */}
      <g style={{ transformOrigin: `${100 * scl}px ${bodyCy - bodyRy * 0.5}px`, animation: (mood === 'feliz' || mood === 'brincalhao' || isPlaying) ? `${tailWag} 0.35s ease-in-out infinite` : 'none' }}>
        <path
          d={`M${100 * scl} ${bodyCy - bodyRy * 0.5} Q${122 * scl} ${bodyCy - bodyRy * 1.3} ${116 * scl} ${bodyCy - bodyRy * 1.8}`}
          stroke={colors.secondary} strokeWidth={scl * 9} fill="none" strokeLinecap="round"
        />
        <path
          d={`M${100 * scl} ${bodyCy - bodyRy * 0.5} Q${122 * scl} ${bodyCy - bodyRy * 1.3} ${116 * scl} ${bodyCy - bodyRy * 1.8}`}
          stroke={colors.primary} strokeWidth={scl * 5} fill="none" strokeLinecap="round"
        />
      </g>
      {/* Body */}
      <ellipse cx="70" cy={bodyCy} rx={bodyRx * scl} ry={bodyRy * scl} fill={colors.primary} />
      {/* Belly */}
      <ellipse cx="70" cy={bodyCy + 4} rx={(bodyRx - 9) * scl} ry={(bodyRy - 8) * scl} fill={colors.accent} />
      {/* Paws */}
      <ellipse cx={50 * scl} cy={bodyCy + bodyRy * scl} rx={isChibi ? 10 * scl : 9 * scl} ry={5.5 * scl} fill={colors.secondary} />
      <ellipse cx={90 * scl} cy={bodyCy + bodyRy * scl} rx={isChibi ? 10 * scl : 9 * scl} ry={5.5 * scl} fill={colors.secondary} />
      {/* Head */}
      <circle cx="70" cy={headCy} r={headR * scl} fill={colors.primary} />
      {/* Floppy ears - bigger, bouncier */}
      {stage === 4 ? (
        /* Adult: perky ears */
        <>
          <ellipse cx={70 - headR * 0.75 * scl} cy={headCy - headR * 0.5 * scl} rx={10 * scl} ry={18 * scl} fill={colors.secondary} transform={`rotate(-15, ${70 - headR * 0.75 * scl}, ${headCy - headR * 0.5 * scl})`} />
          <ellipse cx={70 + headR * 0.75 * scl} cy={headCy - headR * 0.5 * scl} rx={10 * scl} ry={18 * scl} fill={colors.secondary} transform={`rotate(15, ${70 + headR * 0.75 * scl}, ${headCy - headR * 0.5 * scl})`} />
          <ellipse cx={70 - headR * 0.72 * scl} cy={headCy - headR * 0.45 * scl} rx={6 * scl} ry={12 * scl} fill={colors.inner} transform={`rotate(-15, ${70 - headR * 0.72 * scl}, ${headCy - headR * 0.45 * scl})`} />
          <ellipse cx={70 + headR * 0.72 * scl} cy={headCy - headR * 0.45 * scl} rx={6 * scl} ry={12 * scl} fill={colors.inner} transform={`rotate(15, ${70 + headR * 0.72 * scl}, ${headCy - headR * 0.45 * scl})`} />
        </>
      ) : (
        /* Baby/Young: floppy ears */
        <>
          <ellipse cx={38 * scl} cy={headCy + 4 * scl} rx={14 * scl} ry={24 * scl} fill={colors.secondary} transform={`rotate(18, ${38 * scl}, ${headCy + 4 * scl})`} />
          <ellipse cx={102 * scl} cy={headCy + 4 * scl} rx={14 * scl} ry={24 * scl} fill={colors.secondary} transform={`rotate(-18, ${102 * scl}, ${headCy + 4 * scl})`} />
          <ellipse cx={40 * scl} cy={headCy + 6 * scl} rx={8 * scl} ry={16 * scl} fill={colors.inner} transform={`rotate(18, ${40 * scl}, ${headCy + 6 * scl})`} />
          <ellipse cx={100 * scl} cy={headCy + 6 * scl} rx={8 * scl} ry={16 * scl} fill={colors.inner} transform={`rotate(-18, ${100 * scl}, ${headCy + 6 * scl})`} />
        </>
      )}
      {/* Eyes */}
      {mood === 'sonolento' ? (
        <g>
          <line x1={`${57 * scl}`} y1={`${headCy - 4 * scl}`} x2={`${65 * scl}`} y2={`${headCy - 4 * scl}`} stroke="#333" strokeWidth={scl * 2.5} strokeLinecap="round" />
          <line x1={`${75 * scl}`} y1={`${headCy - 4 * scl}`} x2={`${83 * scl}`} y2={`${headCy - 4 * scl}`} stroke="#333" strokeWidth={scl * 2.5} strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <KawaiiEye cx={61 * scl} cy={headCy - 4 * scl} r={eyeR * scl} closed={false} big={mood === 'energico'} scl={scl} />
          <KawaiiEye cx={79 * scl} cy={headCy - 4 * scl} r={eyeR * scl} closed={false} big={mood === 'energico'} scl={scl} />
        </g>
      )}
      {/* Eyebrows for doente */}
      {mood === 'doente' && (
        <g>
          <line x1={`${57 * scl}`} y1={`${headCy - 12 * scl}`} x2={`${65 * scl}`} y2={`${headCy - 10 * scl}`} stroke="#555" strokeWidth={scl * 1.5} strokeLinecap="round" />
          <line x1={`${75 * scl}`} y1={`${headCy - 10 * scl}`} x2={`${83 * scl}`} y2={`${headCy - 12 * scl}`} stroke="#555" strokeWidth={scl * 1.5} strokeLinecap="round" />
        </g>
      )}
      {/* Nose */}
      <ellipse cx="70" cy={headCy + 3 * scl} rx={5 * scl} ry={3.5 * scl} fill={colors.nose} />
      <ellipse cx="69" cy={headCy + 2 * scl} rx={1.5 * scl} ry={1} fill="white" opacity="0.4" />
      {/* Mouth & Tongue */}
      <path d={`M${65 * scl} ${headCy + 7 * scl} Q${70 * scl} ${headCy + 12 * scl} ${75 * scl} ${headCy + 7 * scl}`} stroke="#333" strokeWidth={scl * 1.5} fill="none" />
      {(mood === 'feliz' || mood === 'brincalhao' || mood === 'energico' || isPlaying) && (
        <ellipse cx="70" cy={headCy + 13 * scl} rx={5 * scl} ry={7 * scl} fill="#F48FB1" />
      )}
      {mood === 'com_fome' && <ellipse cx="70" cy={headCy + 12 * scl} rx={6 * scl} ry={8 * scl} fill="#555" />}
      {mood === 'doente' && <path d={`M${65 * scl} ${headCy + 13 * scl} Q${70 * scl} ${headCy + 9 * scl} ${75 * scl} ${headCy + 13 * scl}`} stroke="#333" strokeWidth={scl * 1.3} fill="none" />}
      {/* Cheeks */}
      <ellipse cx={`${50 * scl}`} cy={`${headCy + 5 * scl}`} rx={5.5 * scl} ry={3.5 * scl} fill="#FFAB91" opacity={isPetting ? 0.8 : 0.45} />
      <ellipse cx={`${90 * scl}`} cy={`${headCy + 5 * scl}`} rx={5.5 * scl} ry={3.5 * scl} fill="#FFAB91" opacity={isPetting ? 0.8 : 0.45} />
      {/* Crown for adult */}
      {stage === 4 && <Crown x={55} y={headCy - headR * 0.85 * scl - 16} scl={0.9} ornate />}
      {/* Adult glow */}
      {stage === 4 && (
        <ellipse cx="70" cy={bodyCy} rx={bodyRx * scl + 8} ry={bodyRy * scl + 8}
          fill="none" stroke="rgba(255,215,0,0.15)" strokeWidth="3" style={{ animation: `${pulseAnim} 3s ease-in-out infinite` }} />
      )}
    </svg>
  );
};

// ─── BIRD SVG (Stages 2-4) ───────────────────────────────────────────────────

const BirdSVG = ({ species, mood, stage, size, interaction }) => {
  const colors = speciesColors[species] || speciesColors.passaro;
  const scl = sizeScales[stage] || 1;
  const isEating = interaction === 'feed';
  const isPetting = interaction === 'pet';
  const isPlaying = interaction === 'play';
  const anim = isPlaying ? excitedAnim : isEating ? eatAnim : moodAnimations[mood] || floatAnim;
  const isChibi = stage === 2;
  const isAdult = stage === 4;

  const headR = isChibi ? 26 : isAdult ? 24 : 25;
  const bodyRx = isChibi ? 22 : isAdult ? 27 : 24;
  const bodyRy = isChibi ? 26 : isAdult ? 32 : 28;
  const headCy = isChibi ? 50 : 52;
  const headCx = isChibi ? 62 : 60;
  const eyeR = isChibi ? 5.5 : isAdult ? 5 : 5;
  // ── BABY (CHIBI) BIRD ──────────────────────────────────────
  if (isChibi) {
    const cH = 24 * scl;
    const cBx = 20 * scl;
    const cBy = 24 * scl;
    const cEy = 7 * scl;
    const cHcy = 50 * scl;
    const cBcy = 106 * scl;

    return (
      <svg width={size} height={size * 1.15} viewBox="0 0 140 160" style={{ animation: `${anim} ${isPlaying ? '1s' : '2.5s'} ease-in-out infinite` }}>
        {/* Shadow */}
        <ellipse cx="70" cy="152" rx={cBx + 2} ry="4" fill="rgba(0,0,0,0.08)" />

        {/* Music notes floating - baby is chirping */}
        <text x="105" y="38" fontSize="10" fill="#E91E63" opacity="0.6" style={{ animation: `${floatAnim} 2s ease-in-out 0s infinite` }}>♪</text>
        <text x="28" y="55" fontSize="8" fill="#9C27B0" opacity="0.5" style={{ animation: `${floatAnim} 2.5s ease-in-out 0.6s infinite` }}>♫</text>

        {/* Round fluffball body */}
        <ellipse cx="70" cy={cBcy} rx={cBx} ry={cBy} fill={colors.primary} />
        {/* Belly */}
        <ellipse cx="70" cy={cBcy + 2} rx={cBx - 6} ry={cBy - 7} fill={colors.accent} />

        {/* Tiny stub wings on sides */}
        <ellipse cx={70 - cBx * 0.85} cy={cBcy - cBy * 0.1} rx={7 * scl} ry={5 * scl} fill={colors.secondary} transform={`rotate(20, ${70 - cBx * 0.85}, ${cBcy - cBy * 0.1})`} />
        <ellipse cx={70 + cBx * 0.85} cy={cBcy - cBy * 0.1} rx={7 * scl} ry={5 * scl} fill={colors.secondary} transform={`rotate(-20, ${70 + cBx * 0.85}, ${cBcy - cBy * 0.1})`} />

        {/* Simple stick legs */}
        <line x1={70 - 5 * scl} y1={cBcy + cBy} x2={70 - 7 * scl} y2={cBcy + cBy + 10 * scl} stroke={colors.nose} strokeWidth={scl * 2} strokeLinecap="round" />
        <line x1={70 + 5 * scl} y1={cBcy + cBy} x2={70 + 7 * scl} y2={cBcy + cBy + 10 * scl} stroke={colors.nose} strokeWidth={scl * 2} strokeLinecap="round" />
        {/* Tiny feet */}
        <line x1={70 - 11 * scl} y1={cBcy + cBy + 10 * scl} x2={70 - 3 * scl} y2={cBcy + cBy + 10 * scl} stroke={colors.nose} strokeWidth={scl * 1.8} strokeLinecap="round" />
        <line x1={70 + 3 * scl} y1={cBcy + cBy + 10 * scl} x2={70 + 11 * scl} y2={cBcy + cBy + 10 * scl} stroke={colors.nose} strokeWidth={scl * 1.8} strokeLinecap="round" />

        {/* Disproportionately large head */}
        <circle cx="70" cy={cHcy} r={cH} fill={colors.primary} />
        {/* Head highlight */}
        <circle cx="67" cy={cHcy - cH * 0.15} r={cH * 0.4} fill="white" opacity="0.12" />

        {/* Tiny tuft of 2 feathers on top */}
        <ellipse cx={70 - 3 * scl} cy={cHcy - cH * 0.85} rx={2.5 * scl} ry={6 * scl} fill={colors.secondary} transform={`rotate(-12, ${70 - 3 * scl}, ${cHcy - cH * 0.85})`} />
        <ellipse cx={70 + 3 * scl} cy={cHcy - cH * 0.88} rx={2 * scl} ry={5 * scl} fill={colors.primary} transform={`rotate(10, ${70 + 3 * scl}, ${cHcy - cH * 0.88})`} />

        {/* Huge sparkly eyes */}
        {mood === 'sonolento' ? (
          <g>
            <line x1={70 - cH * 0.32} y1={cHcy - 1} x2={70 - cH * 0.08} y2={cHcy - 1} stroke="#333" strokeWidth={scl * 2.2} strokeLinecap="round" />
            <line x1={70 + cH * 0.08} y1={cHcy - 1} x2={70 + cH * 0.32} y2={cHcy - 1} stroke="#333" strokeWidth={scl * 2.2} strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <KawaiiEye cx={70 - cH * 0.22} cy={cHcy - 1} r={cEy} closed={mood === 'triste'} big={mood === 'energico'} scl={scl} />
            <KawaiiEye cx={70 + cH * 0.22} cy={cHcy - 1} r={cEy} closed={mood === 'triste'} big={mood === 'energico'} scl={scl} />
          </g>
        )}

        {/* Tiny cute triangle beak */}
        {(mood === 'feliz' || mood === 'brincalhao' || isPlaying) ? (
          <g>
            <polygon points={`${70 + cH * 0.55},${cHcy - 1} ${70 + cH * 1.1},${cHcy - 3} ${70 + cH * 0.55},${cHcy + 1}`} fill={colors.nose} />
            <polygon points={`${70 + cH * 0.55},${cHcy + 1} ${70 + cH * 1.05},${cHcy + 4} ${70 + cH * 0.55},${cHcy + 3}`} fill="#EF6C00" />
          </g>
        ) : mood === 'triste' ? (
          <polygon points={`${70 + cH * 0.55},${cHcy + 1} ${70 + cH * 0.95},${cHcy + 4} ${70 + cH * 0.55},${cHcy + 3}`} fill={colors.nose} opacity="0.8" />
        ) : mood === 'com_fome' ? (
          <g>
            <polygon points={`${70 + cH * 0.55},${cHcy} ${70 + cH * 1.1},${cHcy + 2} ${70 + cH * 0.55},${cHcy + 4}`} fill="#F44336" />
            <polygon points={`${70 + cH * 0.55},${cHcy + 4} ${70 + cH * 1.0},${cHcy + 7} ${70 + cH * 0.55},${cHcy + 6}`} fill="#D32F2F" />
          </g>
        ) : (
          <polygon points={`${70 + cH * 0.55},${cHcy - 0.5} ${70 + cH * 1.1},${cHcy + 2} ${70 + cH * 0.55},${cHcy + 4}`} fill={colors.nose} />
        )}

        {/* Always-visible rosy cheeks */}
        <ellipse cx={70 - cH * 0.35} cy={cHcy + 5} rx={4.5 * scl} ry={3 * scl} fill="#FFAB91" opacity={isPetting ? 0.8 : 0.6} />
        <ellipse cx={70 + cH * 0.15} cy={cHcy + 5} rx={4.5 * scl} ry={3 * scl} fill="#FFAB91" opacity={isPetting ? 0.8 : 0.6} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 140 160" style={{ animation: `${anim} ${isPlaying ? '1s' : '2.5s'} ease-in-out infinite` }}>
      {/* Shadow */}
      <ellipse cx="70" cy="152" rx={22 * scl} ry="4" fill="rgba(0,0,0,0.08)" />
      {/* Tail feathers */}
      <path d={`M${88 * scl} 105 L${118 * scl} 78 L${112 * scl} 95 L${125 * scl} 82`} fill={colors.secondary} opacity="0.9" />
      {isAdult && <path d={`M${85 * scl} 110 L${115 * scl} 85 L${122 * scl} 90 L${108 * scl} 105`} fill={colors.accent} opacity="0.6" />}
      {/* Body */}
      <ellipse cx="70" cy={headCy + bodyRy * 1.1} rx={bodyRx * scl} ry={bodyRy * scl} fill={colors.primary} />
      {/* Belly */}
      <ellipse cx="70" cy={headCy + bodyRy * 1.1 + 4} rx={(bodyRx - 7) * scl} ry={(bodyRy - 8) * scl} fill={colors.accent} />
      {/* Wing - fluffier, animated */}
      <ellipse
        cx={`${82 * scl}`} cy={headCy + bodyRy * 0.9}
        rx={isChibi ? 16 * scl : 20 * scl} ry={isChibi ? 11 * scl : 14 * scl}
        fill={colors.secondary}
        transform={`rotate(-20, ${82 * scl}, ${headCy + bodyRy * 0.9})`}
        style={{ animation: (mood === 'energico' || mood === 'brincalhao' || isPlaying) ? `${pulseAnim} 0.4s ease-in-out infinite` : 'none' }}
      />
      {/* Head - rounder, bigger */}
      <circle cx={headCx} cy={headCy} r={headR * scl} fill={colors.primary} />
      {/* Eyes */}
      {mood === 'sonolento' ? (
        <g>
          <line x1={`${(headCx - 6) * scl}`} y1={`${headCy - 2 * scl}`} x2={`${(headCx - 2) * scl}`} y2={`${headCy - 2 * scl}`} stroke="#333" strokeWidth={scl * 2.2} strokeLinecap="round" />
          <line x1={`${(headCx + 2) * scl}`} y1={`${headCy - 2 * scl}`} x2={`${(headCx + 6) * scl}`} y2={`${headCy - 2 * scl}`} stroke="#333" strokeWidth={scl * 2.2} strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <KawaiiEye cx={(headCx - 5) * scl} cy={headCy - 2 * scl} r={eyeR * scl} closed={mood === 'triste'} big={mood === 'energico'} scl={scl} />
          <KawaiiEye cx={(headCx + 5) * scl} cy={headCy - 2 * scl} r={eyeR * scl} closed={mood === 'triste'} big={mood === 'energico'} scl={scl} />
        </g>
      )}
      {/* Beak */}
      {(mood === 'feliz' || mood === 'brincalhao' || isPlaying) ? (
        /* Open beak for happy */
        <g>
          <polygon points={`${(headCx + headR * 0.6) * scl},${headCy - 2 * scl} ${(headCx + headR * 1.4) * scl},${headCy - 5 * scl} ${(headCx + headR * 0.6) * scl},${headCy + 1 * scl}`} fill={colors.nose} />
          <polygon points={`${(headCx + headR * 0.6) * scl},${headCy + 1 * scl} ${(headCx + headR * 1.3) * scl},${headCy + 6 * scl} ${(headCx + headR * 0.6) * scl},${headCy + 5 * scl}`} fill="#EF6C00" />
        </g>
      ) : mood === 'triste' ? (
        /* Sad droopy beak */
        <polygon points={`${(headCx + headR * 0.6) * scl},${headCy + 1 * scl} ${(headCx + headR * 1.2) * scl},${headCy + 6 * scl} ${(headCx + headR * 0.6) * scl},${headCy + 6 * scl}`} fill={colors.nose} opacity="0.8" />
      ) : (
        <polygon points={`${(headCx + headR * 0.6) * scl},${headCy - 1 * scl} ${(headCx + headR * 1.35) * scl},${headCy + 3 * scl} ${(headCx + headR * 0.6) * scl},${headCy + 5 * scl}`} fill={colors.nose} />
      )}
      {mood === 'com_fome' && <polygon points={`${(headCx + headR * 0.6) * scl},${headCy + 1 * scl} ${(headCx + headR * 1.3) * scl},${headCy + 6 * scl} ${(headCx + headR * 0.6) * scl},${headCy + 5 * scl}`} fill="#F44336" />}
      {/* Cheek */}
      <ellipse cx={`${(headCx + 6) * scl}`} cy={`${headCy + 5 * scl}`} rx={5 * scl} ry={3 * scl} fill="#FFAB91" opacity={isPetting ? 0.75 : 0.45} />
      {/* Feet */}
      <g>
        <line x1={`${58 * scl}`} y1={headCy + bodyRy * 2} x2={`${52 * scl}`} y2={headCy + bodyRy * 2 + 13} stroke={colors.nose} strokeWidth={scl * 2.5} />
        <line x1={`${82 * scl}`} y1={headCy + bodyRy * 2} x2={`${88 * scl}`} y2={headCy + bodyRy * 2 + 13} stroke={colors.nose} strokeWidth={scl * 2.5} />
        <line x1={`${47 * scl}`} y1={headCy + bodyRy * 2 + 13} x2={`${57 * scl}`} y2={headCy + bodyRy * 2 + 13} stroke={colors.nose} strokeWidth={scl * 2} strokeLinecap="round" />
        <line x1={`${83 * scl}`} y1={headCy + bodyRy * 2 + 13} x2={`${93 * scl}`} y2={headCy + bodyRy * 2 + 13} stroke={colors.nose} strokeWidth={scl * 2} strokeLinecap="round" />
      </g>
      {/* Crest feathers for adult */}
      {isAdult && (
        <g>
          <ellipse cx={headCx * scl} cy={(headCy - headR * 0.9) * scl} rx={4 * scl} ry={10 * scl} fill={colors.secondary} transform={`rotate(-10, ${headCx * scl}, ${(headCy - headR * 0.9) * scl})`} />
          <ellipse cx={(headCx + 5) * scl} cy={(headCy - headR * 0.95) * scl} rx={3.5 * scl} ry={9 * scl} fill={colors.primary} transform={`rotate(8, ${(headCx + 5) * scl}, ${(headCy - headR * 0.95) * scl})`} />
          <ellipse cx={(headCx - 5) * scl} cy={(headCy - headR * 0.85) * scl} rx={3 * scl} ry={8 * scl} fill="#FF9800" transform={`rotate(-18, ${(headCx - 5) * scl}, ${(headCy - headR * 0.85) * scl})`} />
        </g>
      )}
      {/* Crown for adult */}
      {stage === 4 && <Crown x={headCx - 10} y={(headCy - headR * 1.2) * scl - 8} scl={0.75} ornate />}
      {/* Adult glow */}
      {stage === 4 && (
        <ellipse cx="70" cy={headCy + bodyRy * 1.1} rx={bodyRx * scl + 8} ry={bodyRy * scl + 8}
          fill="none" stroke="rgba(255,215,0,0.15)" strokeWidth="3" style={{ animation: `${pulseAnim} 3s ease-in-out infinite` }} />
      )}
    </svg>
  );
};

// ─── TURTLE SVG (Stages 2-4) ──────────────────────────────────────────────────

const TurtleSVG = ({ species, mood, stage, size, interaction }) => {
  const colors = speciesColors[species] || speciesColors.tartaruga;
  const scl = sizeScales[stage] || 1;
  const isEating = interaction === 'feed';
  const isPetting = interaction === 'pet';
  const isPlaying = interaction === 'play';
  const anim = isPlaying ? excitedAnim : isEating ? eatAnim : moodAnimations[mood] || floatAnim;
  const isChibi = stage === 2;
  const isAdult = stage === 4;

  // Baby: BIG head, small shell, stubby legs
  // Young: proportional, more detail
  // Adult: ornate shell, graceful
  const headR = isChibi ? 22 : isAdult ? 20 : 19;
  const shellRx = isChibi ? 32 : isAdult ? 42 : 37;
  const shellRy = isChibi ? 26 : isAdult ? 34 : 30;
  const shellCy = isChibi ? 95 : 92;
  const headCy = isChibi ? 52 : 56;
  const neckLen = isChibi ? 6 : isAdult ? 18 : 12;
  const legRx = isChibi ? 8 : isAdult ? 12 : 10;
  const legRy = isChibi ? 6 : isAdult ? 9 : 8;
  const eyeR = isChibi ? 5.5 : isAdult ? 5 : 4.5;
  // ── BABY (CHIBI) TURTLE ───────────────────────────────────
  if (isChibi) {
    const cSx = 28 * scl;
    const cSy = 26 * scl;
    const cH = 24 * scl;
    const cEy = 8 * scl;
    const cScy = 98 * scl;
    const cHcy = 48 * scl;

    return (
      <svg width={size} height={size * 1.15} viewBox="0 0 140 160" style={{ animation: `${anim} ${isPlaying ? '1s' : '3s'} ease-in-out infinite` }}>
        {/* Shadow */}
        <ellipse cx="70" cy="152" rx={cSx + 2} ry="5" fill="rgba(0,0,0,0.08)" />

        {/* Bubbles floating near shell */}
        <circle cx="108" cy="75" r={3 * scl} fill="none" stroke="#90CAF9" strokeWidth={scl * 1} opacity="0.5" style={{ animation: `${floatAnim} 2.5s ease-in-out 0s infinite` }} />
        <circle cx="115" cy="85" r={2 * scl} fill="none" stroke="#90CAF9" strokeWidth={scl * 0.8} opacity="0.4" style={{ animation: `${floatAnim} 3s ease-in-out 0.5s infinite` }} />
        <circle cx="102" cy="65" r={1.5 * scl} fill="#90CAF9" opacity="0.3" style={{ animation: `${floatAnim} 2s ease-in-out 1s infinite` }} />

        {/* Tiny triangle tail */}
        <polygon points={`${70 + cSx * 0.85},${cScy + cSy * 0.3} ${70 + cSx * 1.05},${cScy + cSy * 0.5} ${70 + cSx * 0.95},${cScy + cSy * 0.15}`} fill={colors.primary} />

        {/* Tiny stubby back legs */}
        <ellipse cx={70 - cSx * 0.5} cy={cScy + cSy * 0.45} rx={5 * scl} ry={4 * scl} fill={colors.primary} />
        <ellipse cx={70 + cSx * 0.5} cy={cScy + cSy * 0.45} rx={5 * scl} ry={4 * scl} fill={colors.primary} />
        {/* Tiny stubby front legs */}
        <ellipse cx={70 - cSx * 0.6} cy={cScy - cSy * 0.1} rx={5 * scl} ry={4 * scl} fill={colors.primary} />
        <ellipse cx={70 + cSx * 0.6} cy={cScy - cSy * 0.1} rx={5 * scl} ry={4 * scl} fill={colors.primary} />
        {/* Leg highlights */}
        <ellipse cx={70 - cSx * 0.57} cy={cScy - cSy * 0.14} rx={2.5 * scl} ry={2 * scl} fill={colors.accent} opacity="0.4" />
        <ellipse cx={70 + cSx * 0.57} cy={cScy - cSy * 0.14} rx={2.5 * scl} ry={2 * scl} fill={colors.accent} opacity="0.4" />

        {/* Very round shell - almost circular */}
        <ellipse cx="70" cy={cScy} rx={cSx} ry={cSy} fill={colors.secondary} />
        <ellipse cx="70" cy={cScy - 2} rx={cSx - 3} ry={cSy - 3} fill={colors.primary} />
        <ellipse cx="68" cy={cScy - 3} rx={cSx - 7} ry={cSy - 7} fill={colors.secondary} opacity="0.25" />

        {/* Shell pattern - simple cute dots */}
        <circle cx="70" cy={cScy - 6 * scl} r={2.5 * scl} fill={colors.secondary} opacity="0.4" />
        <circle cx="70" cy={cScy + 6 * scl} r={2.5 * scl} fill={colors.secondary} opacity="0.4" />
        <circle cx={70 - 8 * scl} cy={cScy} r={2 * scl} fill={colors.secondary} opacity="0.35" />
        <circle cx={70 + 8 * scl} cy={cScy} r={2 * scl} fill={colors.secondary} opacity="0.35" />
        <circle cx={70 - 5 * scl} cy={cScy - 5 * scl} r={1.8 * scl} fill={colors.secondary} opacity="0.3" />
        <circle cx={70 + 5 * scl} cy={cScy - 5 * scl} r={1.8 * scl} fill={colors.secondary} opacity="0.3" />
        <circle cx={70 - 5 * scl} cy={cScy + 5 * scl} r={1.8 * scl} fill={colors.secondary} opacity="0.3" />
        <circle cx={70 + 5 * scl} cy={cScy + 5 * scl} r={1.8 * scl} fill={colors.secondary} opacity="0.3" />

        {/* Shell rim highlight */}
        <path
          d={`M${70 - cSx * 0.6} ${cScy - cSy * 0.85} Q70 ${cScy - cSy * 1.02} ${70 + cSx * 0.6} ${cScy - cSy * 0.85}`}
          fill="none" stroke="white" strokeWidth={scl * 1.5} opacity="0.2"
        />

        {/* Small bow/ribbon on shell */}
        <g transform={`translate(${70 + cSx * 0.5}, ${cScy - cSy * 0.6})`}>
          <ellipse cx="-4" cy="0" rx={5 * scl} ry={3 * scl} fill="#E91E63" opacity="0.8" />
          <ellipse cx="4" cy="0" rx={5 * scl} ry={3 * scl} fill="#E91E63" opacity="0.8" />
          <circle cx="0" cy="0" r={2 * scl} fill="#C2185B" />
        </g>

        {/* Short but visible neck */}
        <rect x={70 - 6 * scl} y={cHcy + cH * 0.45} width={12 * scl} height={8 * scl} rx={6 * scl} fill={colors.primary} />

        {/* Giant round head - pops way out */}
        <circle cx="70" cy={cHcy} r={cH} fill={colors.primary} />
        {/* Head highlight */}
        <circle cx="67" cy={cHcy - cH * 0.15} r={cH * 0.45} fill="white" opacity="0.1" />

        {/* Giant sparkly eyes - THE CUTEST */}
        {mood === 'sonolento' ? (
          <g>
            <line x1={70 - cH * 0.3} y1={cHcy - 2} x2={70 - cH * 0.08} y2={cHcy - 2} stroke="#333" strokeWidth={scl * 2.2} strokeLinecap="round" />
            <line x1={70 + cH * 0.08} y1={cHcy - 2} x2={70 + cH * 0.3} y2={cHcy - 2} stroke="#333" strokeWidth={scl * 2.2} strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <KawaiiEye cx={70 - cH * 0.2} cy={cHcy - 2} r={cEy} closed={false} big={mood === 'energico'} scl={scl} />
            <KawaiiEye cx={70 + cH * 0.2} cy={cHcy - 2} r={cEy} closed={false} big={mood === 'energico'} scl={scl} />
          </g>
        )}

        {/* Nose - tiny cute dots */}
        <circle cx={70 - 2 * scl} cy={cHcy + 5} r={1.2 * scl} fill={colors.nose} />
        <circle cx={70 + 2 * scl} cy={cHcy + 5} r={1.2 * scl} fill={colors.nose} />

        {/* Mouth - ω default, mood overrides */}
        {mood === 'triste' ? (
          <path d={`M${70 - cH * 0.15} ${cHcy + 10} Q70 ${cHcy + 6} ${70 + cH * 0.15} ${cHcy + 10}`} stroke="#333" strokeWidth={scl * 1.3} fill="none" />
        ) : mood === 'com_fome' ? (
          <ellipse cx="70" cy={cHcy + 9} rx={3 * scl} ry={2.5 * scl} fill="#555" />
        ) : mood === 'doente' ? (
          <g>
            <path d={`M${70 - cH * 0.12} ${cHcy + 9} Q70 ${cHcy + 5} ${70 + cH * 0.12} ${cHcy + 9}`} stroke="#333" strokeWidth={scl * 1.2} fill="none" strokeDasharray="2 2" />
            <circle cx="70" cy={cHcy + 10} r={1.5 * scl} fill="#9C27B0" opacity="0.3" />
          </g>
        ) : (
          /* ω smile */
          <path d={`M${70 - cH * 0.12} ${cHcy + 7} Q${70 - cH * 0.04} ${cHcy + 11} 70 ${cHcy + 8} Q${70 + cH * 0.04} ${cHcy + 11} ${70 + cH * 0.12} ${cHcy + 7}`} stroke="#333" strokeWidth={scl * 1.2} fill="none" />
        )}

        {/* Always-visible rosy cheeks */}
        <ellipse cx={70 - cH * 0.38} cy={cHcy + 4} rx={5 * scl} ry={3 * scl} fill="#FFAB91" opacity={isPetting ? 0.85 : 0.65} />
        <ellipse cx={70 + cH * 0.38} cy={cHcy + 4} rx={5 * scl} ry={3 * scl} fill="#FFAB91" opacity={isPetting ? 0.85 : 0.65} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 140 160" style={{ animation: `${anim} ${isPlaying ? '1s' : '3s'} ease-in-out infinite` }}>
      {/* Shadow */}
      <ellipse cx="70" cy="152" rx={shellRx * scl} ry="5" fill="rgba(0,0,0,0.08)" />

      {/* Tiny tail */}
      <path
        d={`M${70 + shellRx * 0.8 * scl} ${shellCy + shellRy * 0.3 * scl} Q${70 + shellRx * 1.05 * scl} ${shellCy + shellRy * 0.6 * scl} ${70 + shellRx * 0.95 * scl} ${shellCy + shellRy * 0.8 * scl}`}
        stroke={colors.primary} strokeWidth={scl * 4} fill="none" strokeLinecap="round"
      />

      {/* Back legs */}
      <ellipse cx={`${70 - shellRx * 0.55 * scl}`} cy={shellCy + shellRy * 0.55 * scl} rx={legRx * scl} ry={legRy * scl} fill={colors.primary} />
      <ellipse cx={`${70 + shellRx * 0.55 * scl}`} cy={shellCy + shellRy * 0.55 * scl} rx={legRx * scl} ry={legRy * scl} fill={colors.primary} />
      {/* Front legs */}
      <ellipse cx={`${70 - shellRx * 0.65 * scl}`} cy={shellCy - shellRy * 0.15 * scl} rx={legRx * 1.1 * scl} ry={legRy * 1.1 * scl} fill={colors.primary} />
      <ellipse cx={`${70 + shellRx * 0.65 * scl}`} cy={shellCy - shellRy * 0.15 * scl} rx={legRx * 1.1 * scl} ry={legRy * 1.1 * scl} fill={colors.primary} />
      {/* Leg highlights */}
      <ellipse cx={`${70 - shellRx * 0.6 * scl}`} cy={shellCy - shellRy * 0.2 * scl} rx={(legRx * 0.5) * scl} ry={(legRy * 0.5) * scl} fill={colors.accent} opacity="0.5" />
      <ellipse cx={`${70 + shellRx * 0.6 * scl}`} cy={shellCy - shellRy * 0.2 * scl} rx={(legRx * 0.5) * scl} ry={(legRy * 0.5) * scl} fill={colors.accent} opacity="0.5" />

      {/* Shell - gradient-like layered shapes */}
      <ellipse cx="70" cy={shellCy} rx={shellRx * scl} ry={shellRy * scl} fill={colors.secondary} />
      <ellipse cx="70" cy={shellCy - 2} rx={(shellRx - 3) * scl} ry={(shellRy - 3) * scl} fill={colors.primary} />
      <ellipse cx="68" cy={shellCy - 4} rx={(shellRx - 6) * scl} ry={(shellRy - 6) * scl} fill={colors.secondary} opacity="0.3" />

      {/* Shell patterns */}
      {isChibi ? (
        /* Baby: cute hexagonal/honeycomb pattern - simple */
        <g opacity="0.5">
          {/* Center hexagon approximation */}
          <polygon points={`70,${shellCy - 10 * scl} 78,${shellCy - 5 * scl} 78,${shellCy + 5 * scl} 70,${shellCy + 10 * scl} 62,${shellCy + 5 * scl} 62,${shellCy - 5 * scl}`}
            fill="none" stroke={colors.secondary} strokeWidth={scl * 1.2} />
          {/* Small hexagons around */}
          <polygon points={`70,${shellCy - 18 * scl} 76,${shellCy - 15 * scl} 76,${shellCy - 9 * scl} 70,${shellCy - 12 * scl} 64,${shellCy - 9 * scl} 64,${shellCy - 15 * scl}`}
            fill="none" stroke={colors.secondary} strokeWidth={scl * 0.8} />
          <polygon points={`70,${shellCy + 12 * scl} 76,${shellCy + 9 * scl} 76,${shellCy + 15 * scl} 70,${shellCy + 18 * scl} 64,${shellCy + 15 * scl} 64,${shellCy + 9 * scl}`}
            fill="none" stroke={colors.secondary} strokeWidth={scl * 0.8} />
          <polygon points={`58,${shellCy} 58,${shellCy - 7 * scl} 64,${shellCy - 4 * scl} 64,${shellCy + 4 * scl} 58,${shellCy + 7 * scl}`}
            fill="none" stroke={colors.secondary} strokeWidth={scl * 0.8} />
          <polygon points={`82,${shellCy - 4 * scl} 82,${shellCy + 4 * scl} 76,${shellCy + 7 * scl} 76,${shellCy - 7 * scl}`}
            fill="none" stroke={colors.secondary} strokeWidth={scl * 0.8} />
        </g>
      ) : isAdult ? (
        /* Adult: ornate shell with multiple pattern rings */
        <g>
          {/* Outer ring pattern */}
          <ellipse cx="70" cy={shellCy} rx={(shellRx - 4) * scl} ry={(shellRy - 4) * scl} fill="none" stroke={colors.accent} strokeWidth={scl * 2} opacity="0.5" />
          <ellipse cx="70" cy={shellCy} rx={(shellRx - 10) * scl} ry={(shellRy - 10) * scl} fill="none" stroke={colors.secondary} strokeWidth={scl * 1.5} opacity="0.4" />
          {/* Center star pattern */}
          <polygon points={`70,${shellCy - 16 * scl} 76,${shellCy - 4 * scl} 70,${shellCy + 16 * scl} 64,${shellCy - 4 * scl}`}
            fill={colors.secondary} opacity="0.2" stroke={colors.secondary} strokeWidth={scl * 1} />
          {/* Hexagonal center */}
          <polygon points={`70,${shellCy - 10 * scl} 78,${shellCy - 5 * scl} 78,${shellCy + 5 * scl} 70,${shellCy + 10 * scl} 62,${shellCy + 5 * scl} 62,${shellCy - 5 * scl}`}
            fill={colors.accent} opacity="0.3" stroke={colors.secondary} strokeWidth={scl * 1} />
          {/* Radiating lines */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 70 + Math.cos(rad) * 12 * scl;
            const y1 = shellCy + Math.sin(rad) * 10 * scl;
            const x2 = 70 + Math.cos(rad) * (shellRx - 6) * scl;
            const y2 = shellCy + Math.sin(rad) * (shellRy - 6) * scl;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors.secondary} strokeWidth={scl * 0.8} opacity="0.3" />;
          })}
          {/* Outer scallops */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const cx = 70 + Math.cos(angle) * (shellRx - 7) * scl;
            const cy = shellCy + Math.sin(angle) * (shellRy - 7) * scl;
            return <circle key={i} cx={cx} cy={cy} r={4 * scl} fill={colors.accent} opacity="0.35" />;
          })}
          {/* Shell highlight */}
          <ellipse cx="62" cy={shellCy - 10} rx={14 * scl} ry={10 * scl} fill="white" opacity="0.1" />
        </g>
      ) : (
        /* Young: medium detail pattern */
        <g opacity="0.45">
          <ellipse cx="70" cy={shellCy} rx={(shellRx - 8) * scl} ry={(shellRy - 8) * scl} fill="none" stroke={colors.secondary} strokeWidth={scl * 1.5} />
          <polygon points={`70,${shellCy - 10 * scl} 77,${shellCy - 5 * scl} 77,${shellCy + 5 * scl} 70,${shellCy + 10 * scl} 63,${shellCy + 5 * scl} 63,${shellCy - 5 * scl}`}
            fill="none" stroke={colors.secondary} strokeWidth={scl * 1.2} />
          {/* Cross lines */}
          <line x1="70" y1={shellCy - (shellRy - 10) * scl} x2="70" y2={shellCy + (shellRy - 10) * scl} stroke={colors.secondary} strokeWidth={scl * 1} />
          <line x1={70 - (shellRx - 10) * scl} y1={shellCy} x2={70 + (shellRx - 10) * scl} y2={shellCy} stroke={colors.secondary} strokeWidth={scl * 1} />
          {/* Corner hexagons */}
          {[
            { x: 70 - 16 * scl, y: shellCy - 12 * scl },
            { x: 70 + 16 * scl, y: shellCy - 12 * scl },
            { x: 70 - 16 * scl, y: shellCy + 12 * scl },
            { x: 70 + 16 * scl, y: shellCy + 12 * scl }
          ].map((pos, i) => (
            <polygon key={i} points={`${pos.x},${pos.y - 5 * scl} ${pos.x + 4 * scl},${pos.y - 2.5 * scl} ${pos.x + 4 * scl},${pos.y + 2.5 * scl} ${pos.x},${pos.y + 5 * scl} ${pos.x - 4 * scl},${pos.y + 2.5 * scl} ${pos.x - 4 * scl},${pos.y - 2.5 * scl}`}
              fill="none" stroke={colors.secondary} strokeWidth={scl * 0.8} />
          ))}
        </g>
      )}

      {/* Shell rim highlight */}
      <path
        d={`M${70 - shellRx * 0.7} ${shellCy - shellRy * 0.9} Q70 ${shellCy - shellRy * 1.05} ${70 + shellRx * 0.7} ${shellCy - shellRy * 0.9}`}
        fill="none" stroke="white" strokeWidth={scl * 1.5} opacity="0.2"
      />

      {/* Neck */}
      <rect x={70 - 7 * scl} y={headCy + headR * 0.5} width={14 * scl} height={neckLen * scl} rx={7 * scl} fill={colors.primary} />

      {/* Head - BIG for baby, proportional for others */}
      <circle cx="70" cy={headCy} r={headR * scl} fill={colors.primary} />
      {/* Head highlight */}
      <circle cx={66} cy={headCy - headR * 0.2} r={headR * 0.6 * scl} fill="white" opacity="0.1" />

      {/* Eyes - big, round, kawaii, evenly spaced */}
      {mood === 'sonolento' ? (
        <g>
          <line x1={`${60 * scl}`} y1={`${headCy - 2 * scl}`} x2={`${66 * scl}`} y2={`${headCy - 2 * scl}`} stroke="#333" strokeWidth={scl * 2.2} strokeLinecap="round" />
          <line x1={`${74 * scl}`} y1={`${headCy - 2 * scl}`} x2={`${80 * scl}`} y2={`${headCy - 2 * scl}`} stroke="#333" strokeWidth={scl * 2.2} strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <KawaiiEye cx={63 * scl} cy={headCy - 2 * scl} r={eyeR * scl} closed={false} big={isChibi || mood === 'energico'} scl={scl} />
          <KawaiiEye cx={77 * scl} cy={headCy - 2 * scl} r={eyeR * scl} closed={false} big={isChibi || mood === 'energico'} scl={scl} />
        </g>
      )}

      {/* Nose - tiny cute dots */}
      <circle cx={`${66 * scl}`} cy={`${headCy + 5 * scl}`} r={1.2 * scl} fill={colors.nose} />
      <circle cx={`${74 * scl}`} cy={`${headCy + 5 * scl}`} r={1.2 * scl} fill={colors.nose} />

      {/* Mouth expressions */}
      {mood === 'feliz' && <path d={`M64 ${headCy + 8 * scl} Q70 ${headCy + 13 * scl} 76 ${headCy + 8 * scl}`} stroke="#333" strokeWidth={scl * 1.5} fill="none" />}
      {mood === 'com_fome' && <ellipse cx="70" cy={headCy + 10 * scl} rx={3.5 * scl} ry={3 * scl} fill="#555" />}
      {mood === 'triste' && <path d={`M64 ${headCy + 12 * scl} Q70 ${headCy + 7 * scl} 76 ${headCy + 12 * scl}`} stroke="#333" strokeWidth={scl * 1.5} fill="none" />}
      {mood === 'brincalhao' && <circle cx="70" cy={headCy + 10 * scl} r={3 * scl} fill="#555" />}
      {mood === 'doente' && (
        <g>
          <path d={`M64 ${headCy + 11 * scl} Q70 ${headCy + 7 * scl} 76 ${headCy + 11 * scl}`} stroke="#333" strokeWidth={scl * 1.3} fill="none" strokeDasharray="2 2" />
          <circle cx="70" cy={headCy + 13 * scl} r={2 * scl} fill="#9C27B0" opacity="0.3" />
        </g>
      )}

      {/* Cheeks - always visible, stronger when petted */}
      <ellipse cx={`${57 * scl}`} cy={`${headCy + 4 * scl}`} rx={5 * scl} ry={3 * scl} fill="#FFAB91" opacity={isPetting ? 0.8 : 0.45} />
      <ellipse cx={`${83 * scl}`} cy={`${headCy + 4 * scl}`} rx={5 * scl} ry={3 * scl} fill="#FFAB91" opacity={isPetting ? 0.8 : 0.45} />

      {/* Crown for adult */}
      {stage === 4 && <Crown x={55} y={headCy - headR * scl - 14} scl={0.85} ornate />}

      {/* Adult glow */}
      {stage === 4 && (
        <ellipse cx="70" cy={shellCy} rx={shellRx * scl + 10} ry={shellRy * scl + 10}
          fill="none" stroke="rgba(255,215,0,0.18)" strokeWidth="3" style={{ animation: `${pulseAnim} 3s ease-in-out infinite` }} />
      )}
    </svg>
  );
};

// ─── SpeechBubble ─────────────────────────────────────────────────────────────

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

// ─── Main Pet Animation Component ─────────────────────────────────────────────

const PetAnimation = ({ species, mood = 'feliz', evolutionStage = 1, size = 180, onInteract, excited, interaction = null }) => {
  const [hearts, setHearts] = useState(false);
  const [sparkles, setSparkles] = useState(false);
  const [showSpeech, setShowSpeech] = useState(true);
  const [activeParticles, setActiveParticles] = useState({ food: false, hearts: false, stars: false, blush: false });

  useEffect(() => { setShowSpeech(true); }, [evolutionStage]);

  const clearParticle = useCallback((key) => {
    setActiveParticles(prev => ({ ...prev, [key]: false }));
  }, []);

  // Handle interaction prop changes
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
