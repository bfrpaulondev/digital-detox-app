import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, keyframes } from '@mui/material';

// Keyframe animations
const floatAnim = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const bounceAnim = keyframes`
  0%, 100% { transform: translateY(0px) scale(1); }
  30% { transform: translateY(-15px) scale(1.05); }
  50% { transform: translateY(0px) scale(0.95); }
  70% { transform: translateY(-8px) scale(1.02); }
`;

const wobbleAnim = keyframes`
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
`;

const pulseAnim = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
`;

const sleepAnim = keyframes`
  0%, 100% { transform: translateY(0px) rotate(-2deg); }
  50% { transform: translateY(2px) rotate(2deg); }
`;

const excitedAnim = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  15% { transform: translateY(-20px) rotate(-5deg); }
  30% { transform: translateY(-5px) rotate(5deg); }
  45% { transform: translateY(-18px) rotate(-3deg); }
  60% { transform: translateY(0) rotate(3deg); }
  75% { transform: translateY(-12px) rotate(-2deg); }
  100% { transform: translateY(0) rotate(0deg); }
`;

const heartFloat = keyframes`
  0% { opacity: 1; transform: translateY(0) scale(0.5); }
  50% { opacity: 0.8; transform: translateY(-30px) scale(1); }
  100% { opacity: 0; transform: translateY(-60px) scale(0.3); }
`;

const glowAnim = keyframes`
  0%, 100% { filter: drop-shadow(0 0 8px rgba(108,99,255,0.3)); }
  50% { filter: drop-shadow(0 0 20px rgba(108,99,255,0.7)); }
`;

const sparkleAnim = keyframes`
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
`;

const zzzAnim = keyframes`
  0% { opacity: 0; transform: translate(0, 0) scale(0.8); }
  50% { opacity: 1; transform: translate(15px, -20px) scale(1.2); }
  100% { opacity: 0; transform: translate(30px, -40px) scale(0.6); }
`;

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
  energico: bounceAnim,
  com_fome: wobbleAnim,
  brincalhao: floatAnim
};

const speciesColors = {
  gato: { primary: '#FF9800', secondary: '#F57C00', accent: '#FFE0B2', nose: '#E91E63', inner: '#FFCCBC' },
  cao: { primary: '#8D6E63', secondary: '#6D4C41', accent: '#D7CCC8', nose: '#4E342E', inner: '#FFCCBC' },
  passaro: { primary: '#42A5F5', secondary: '#1E88E5', accent: '#BBDEFB', nose: '#FF9800', inner: '#FFE082' },
  tartaruga: { primary: '#66BB6A', secondary: '#43A047', accent: '#A5D6A7', nose: '#2E7D32', inner: '#C8E6C9' }
};

const HeartParticles = ({ show }) => {
  if (!show) return null;
  const hearts = [
    { left: '30%', delay: '0s', size: 20 },
    { left: '50%', delay: '0.15s', size: 24 },
    { left: '70%', delay: '0.3s', size: 18 },
    { left: '40%', delay: '0.45s', size: 22 },
    { left: '60%', delay: '0.2s', size: 20 }
  ];
  return (
    <Box sx={{ position: 'absolute', top: '20%', left: 0, right: 0, pointerEvents: 'none' }}>
      {hearts.map((h, i) => (
        <Box key={i} sx={{
          position: 'absolute', left: h.left, fontSize: h.size, color: '#E91E63',
          animation: `${heartFloat} 1s ease-out ${h.delay} forwards`
        }}>
          ❤
        </Box>
      ))}
    </Box>
  );
};

const SparkleEffect = ({ show }) => {
  if (!show) return null;
  const sparkles = Array.from({ length: 6 }, (_, i) => ({
    top: `${10 + Math.random() * 80}%`,
    left: `${10 + Math.random() * 80}%`,
    delay: `${i * 0.1}s`,
    size: 8 + Math.random() * 8
  }));
  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {sparkles.map((s, i) => (
        <Box key={i} sx={{
          position: 'absolute', top: s.top, left: s.left, fontSize: s.size,
          animation: `${sparkleAnim} 0.8s ease-in-out ${s.delay} infinite`
        }}>
          ✨
        </Box>
      ))}
    </Box>
  );
};

const ZzzEffect = ({ show }) => {
  if (!show) return null;
  return (
    <Box sx={{ position: 'absolute', top: '10%', right: '15%', pointerEvents: 'none' }}>
      {[0, 1, 2].map(i => (
        <Typography key={i} sx={{
          position: 'absolute', top: i * 15, right: i * 10,
          fontSize: 12 + i * 4, fontWeight: 700, color: '#9C27B0',
          animation: `${zzzAnim} 2s ease-in-out ${i * 0.5}s infinite`,
          fontFamily: 'monospace'
        }}>
          Z
        </Typography>
      ))}
    </Box>
  );
};

// EGG SVG (Stage 1)
const EggSVG = ({ species, mood, size }) => {
  const colors = speciesColors[species] || speciesColors.gato;
  const moodAnim = mood === 'energico' ? bounceAnim : wobbleAnim;
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 120 140" style={{ animation: `${moodAnim} 3s ease-in-out infinite` }}>
      {/* Shadow */}
      <ellipse cx="60" cy="130" rx="35" ry="6" fill="rgba(0,0,0,0.1)" />
      {/* Egg body */}
      <ellipse cx="60" cy="65" rx="45" ry="55" fill={colors.primary} />
      <ellipse cx="60" cy="65" rx="40" ry="50" fill={colors.accent} />
      {/* Spots */}
      <circle cx="40" cy="45" r="8" fill={colors.secondary} opacity="0.6" />
      <circle cx="75" cy="55" r="6" fill={colors.secondary} opacity="0.5" />
      <circle cx="50" cy="80" r="7" fill={colors.secondary} opacity="0.4" />
      {/* Shine */}
      <ellipse cx="45" cy="40" rx="12" ry="20" fill="white" opacity="0.25" />
      {/* Crack lines based on mood */}
      {mood === 'energico' && (
        <>
          <path d="M55 25 L58 40 L50 50 L60 60" stroke={colors.secondary} strokeWidth="2" fill="none" />
          <path d="M58 40 L68 35" stroke={colors.secondary} strokeWidth="1.5" fill="none" />
        </>
      )}
      {/* Eyes (small dots emerging) */}
      {mood !== 'sonolento' && (
        <>
          <circle cx="48" cy="58" r="4" fill="#333" />
          <circle cx="72" cy="58" r="4" fill="#333" />
          <circle cx="46" cy="56" r="1.5" fill="white" />
          <circle cx="70" cy="56" r="1.5" fill="white" />
        </>
      )}
      {mood === 'sonolento' && (
        <>
          <line x1="43" y1="58" x2="53" y2="58" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="67" y1="58" x2="77" y2="58" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {/* Mouth */}
      {mood === 'feliz' && <path d="M52 68 Q60 75 68 68" stroke="#333" strokeWidth="2" fill="none" />}
      {mood === 'com_fome' && <ellipse cx="60" cy="70" rx="5" ry="4" fill="#333" />}
      {mood === 'triste' && <path d="M52 73 Q60 66 68 73" stroke="#333" strokeWidth="2" fill="none" />}
    </svg>
  );
};

// CAT SVG (Stages 2-4)
const CatSVG = ({ species, mood, stage, size }) => {
  const colors = speciesColors[species] || speciesColors.gato;
  const scl = stage === 2 ? 0.7 : stage === 3 ? 0.85 : 1;
  const earSize = scl * 25;
  const bodyH = scl * 45;

  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 140 150" style={{ animation: `${moodAnimations[mood]} 2.5s ease-in-out infinite` }}>
      {/* Shadow */}
      <ellipse cx="70" cy="140" rx={30 * scl} ry="5" fill="rgba(0,0,0,0.08)" />
      {/* Tail */}
      <path d={`M${95 * scl} ${110 - bodyH * 0.3} Q${115 * scl} ${90 - bodyH * 0.5} ${105 * scl} ${70 - bodyH * 0.4}`}
        stroke={colors.secondary} strokeWidth={scl * 6} fill="none" strokeLinecap="round"
        style={{ transformOrigin: `${95 * scl}px ${110 - bodyH * 0.3}px` }} />
      {/* Body */}
      <ellipse cx="70" cy={115 - bodyH * 0.2} rx={28 * scl} ry={bodyH * 0.4} fill={colors.primary} />
      {/* Belly */}
      <ellipse cx="70" cy={115 - bodyH * 0.15} rx={18 * scl} ry={bodyH * 0.28} fill={colors.accent} />
      {/* Head */}
      <circle cx="70" cy={55 * scl} r={28 * scl} fill={colors.primary} />
      {/* Ears */}
      <polygon points={`${45 * scl},${38 * scl} ${38 * scl},${12 * scl} ${55 * scl},${30 * scl}`} fill={colors.primary} />
      <polygon points={`${95 * scl},${38 * scl} ${102 * scl},${12 * scl} ${85 * scl},${30 * scl}`} fill={colors.primary} />
      <polygon points={`${47 * scl},${36 * scl} ${42 * scl},${18 * scl} ${54 * scl},${32 * scl}`} fill={colors.inner} />
      <polygon points={`${93 * scl},${36 * scl} ${98 * scl},${18 * scl} ${86 * scl},${32 * scl}`} fill={colors.inner} />
      {/* Face */}
      {/* Eyes */}
      {mood === 'sonolento' ? (
        <>
          <line x1={`${55 * scl}`} y1={`${52 * scl}`} x2={`${63 * scl}`} y2={`${52 * scl}`} stroke="#333" strokeWidth={scl * 2.5} strokeLinecap="round" />
          <line x1={`${77 * scl}`} y1={`${52 * scl}`} x2={`${85 * scl}`} y2={`${52 * scl}`} stroke="#333" strokeWidth={scl * 2.5} strokeLinecap="round" />
        </>
      ) : mood === 'brincalhao' ? (
        <>
          <ellipse cx={`${59 * scl}`} cy={`${52 * scl}`} rx={5 * scl} ry={5 * scl} fill="#333" />
          <line x1={`${77 * scl}`} y1={`${49 * scl}`} x2={`${85 * scl}`} y2={`${49 * scl}`} stroke="#333" strokeWidth={scl * 2.5} strokeLinecap="round" />
          <circle cx={`${57 * scl}`} cy={`${50 * scl}`} r={1.5 * scl} fill="white" />
        </>
      ) : (
        <>
          <ellipse cx={`${59 * scl}`} cy={`${52 * scl}`} rx={5 * scl} ry={mood === 'energico' ? 6 * scl : 5 * scl} fill="#333" />
          <ellipse cx={`${81 * scl}`} cy={`${52 * scl}`} rx={5 * scl} ry={mood === 'energico' ? 6 * scl : 5 * scl} fill="#333" />
          <circle cx={`${57 * scl}`} cy={`${50 * scl}`} r={1.5 * scl} fill="white" />
          <circle cx={`${79 * scl}`} cy={`${50 * scl}`} r={1.5 * scl} fill="white" />
        </>
      )}
      {/* Nose */}
      <ellipse cx="70" cy={`${60 * scl}`} rx={3 * scl} ry={2 * scl} fill={colors.nose} />
      {/* Mouth */}
      <path d={`M64 ${63 * scl} Q70 ${67 * scl} 76 ${63 * scl}`} stroke="#333" strokeWidth={scl * 1.5} fill="none" />
      {mood === 'com_fome' && <ellipse cx="70" cy={`${66 * scl}`} rx={4 * scl} ry={3 * scl} fill="#E91E63" />}
      {mood === 'triste' && <path d={`M64 ${67 * scl} Q70 ${63 * scl} 76 ${67 * scl}`} stroke="#333" strokeWidth={scl * 1.5} fill="none" />}
      {/* Whiskers */}
      <line x1={`${35 * scl}`} y1={`${55 * scl}`} x2={`${55 * scl}`} y2={`${58 * scl}`} stroke="#555" strokeWidth={scl * 1} />
      <line x1={`${35 * scl}`} y1={`${62 * scl}`} x2={`${55 * scl}`} y2={`${62 * scl}`} stroke="#555" strokeWidth={scl * 1} />
      <line x1={`${85 * scl}`} y1={`${58 * scl}`} x2={`${105 * scl}`} y2={`${55 * scl}`} stroke="#555" strokeWidth={scl * 1} />
      <line x1={`${85 * scl}`} y1={`${62 * scl}`} x2={`${105 * scl}`} y2={`${62 * scl}`} stroke="#555" strokeWidth={scl * 1} />
      {/* Paws */}
      <ellipse cx={`${52 * scl}`} cy={`${120 * scl}`} rx={8 * scl} ry={5 * scl} fill={colors.secondary} />
      <ellipse cx={`${88 * scl}`} cy={`${120 * scl}`} rx={8 * scl} ry={5 * scl} fill={colors.secondary} />
      {/* Crown for adult stage */}
      {stage === 4 && (
        <g transform={`translate(55, ${12 * scl})`}>
          <polygon points="15,0 0,12 3,4 0,15 15,8 30,15 27,4 30,12" fill="#FFD700" stroke="#FFA000" strokeWidth="1" />
          <circle cx="8" cy="6" r="2" fill="#E91E63" />
          <circle cx="15" cy="3" r="2" fill="#2196F3" />
          <circle cx="22" cy="6" r="2" fill="#4CAF50" />
        </g>
      )}
      {/* Cheeks blush */}
      <ellipse cx={`${46 * scl}`} cy={`${62 * scl}`} rx={5 * scl} ry={3 * scl} fill="#FFAB91" opacity="0.5" />
      <ellipse cx={`${94 * scl}`} cy={`${62 * scl}`} rx={5 * scl} ry={3 * scl} fill="#FFAB91" opacity="0.5" />
    </svg>
  );
};

// DOG SVG (Stages 2-4)
const DogSVG = ({ species, mood, stage, size }) => {
  const colors = speciesColors[species] || speciesColors.cao;
  const scl = stage === 2 ? 0.7 : stage === 3 ? 0.85 : 1;

  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 140 150" style={{ animation: `${moodAnimations[mood]} 2.5s ease-in-out infinite` }}>
      <ellipse cx="70" cy="140" rx={30 * scl} ry="5" fill="rgba(0,0,0,0.08)" />
      {/* Tail */}
      <path d={`M${100 * scl} ${95 * scl} Q${125 * scl} ${75 * scl} ${115 * scl} ${60 * scl}`}
        stroke={colors.secondary} strokeWidth={scl * 8} fill="none" strokeLinecap="round"
        style={{ animation: mood === 'feliz' || mood === 'brincalhao' ? `${wobbleAnim} 0.4s ease-in-out infinite` : 'none' }} />
      {/* Body */}
      <ellipse cx="70" cy="105" rx={32 * scl} ry={40 * scl} fill={colors.primary} />
      <ellipse cx="70" cy="110" rx={22 * scl} ry={28 * scl} fill={colors.accent} />
      {/* Head */}
      <circle cx="70" cy="55" r={30 * scl} fill={colors.primary} />
      {/* Floppy ears */}
      <ellipse cx="35" cy="50" rx={12 * scl} ry={22 * scl} fill={colors.secondary} transform={`rotate(15, 35, 50)`} />
      <ellipse cx="105" cy="50" rx={12 * scl} ry={22 * scl} fill={colors.secondary} transform={`rotate(-15, 105, 50)`} />
      {/* Eyes */}
      {mood === 'sonolento' ? (
        <>
          <line x1={`${55 * scl}`} y1="52" x2={`${63 * scl}`} y2="52" stroke="#333" strokeWidth={scl * 2.5} strokeLinecap="round" />
          <line x1={`${77 * scl}`} y1="52" x2={`${85 * scl}`} y2="52" stroke="#333" strokeWidth={scl * 2.5} strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={`${59 * scl}`} cy="52" r={5 * scl} fill="#333" />
          <circle cx={`${81 * scl}`} cy="52" r={5 * scl} fill="#333" />
          <circle cx={`${57 * scl}`} cy="50" r={1.5 * scl} fill="white" />
          <circle cx={`${79 * scl}`} cy="50" r={1.5 * scl} fill="white" />
        </>
      )}
      {/* Nose */}
      <ellipse cx="70" cy="60" rx={4 * scl} ry={3 * scl} fill={colors.nose} />
      {/* Mouth & Tongue */}
      <path d="M65 63 Q70 68 75 63" stroke="#333" strokeWidth={scl * 1.5} fill="none" />
      {(mood === 'feliz' || mood === 'brincalhao' || mood === 'energico') && (
        <ellipse cx="70" cy="70" rx={5 * scl} ry={7 * scl} fill="#E91E63" />
      )}
      {mood === 'com_fome' && <ellipse cx="70" cy="70" rx={6 * scl} ry={8 * scl} fill="#333" />}
      {/* Paws */}
      <ellipse cx={`${52 * scl}`} cy="130" rx={10 * scl} ry={6 * scl} fill={colors.secondary} />
      <ellipse cx={`${88 * scl}`} cy="130" rx={10 * scl} ry={6 * scl} fill={colors.secondary} />
      {/* Cheeks */}
      <ellipse cx={`${46 * scl}`} cy="62" rx={5 * scl} ry={3 * scl} fill="#FFAB91" opacity="0.5" />
      <ellipse cx={`${94 * scl}`} cy="62" rx={5 * scl} ry={3 * scl} fill="#FFAB91" opacity="0.5" />
      {/* Crown */}
      {stage === 4 && (
        <g transform={`translate(55, 10)`}>
          <polygon points="15,0 0,12 3,4 0,15 15,8 30,15 27,4 30,12" fill="#FFD700" stroke="#FFA000" strokeWidth="1" />
        </g>
      )}
    </svg>
  );
};

// BIRD SVG (Stages 2-4)
const BirdSVG = ({ species, mood, stage, size }) => {
  const colors = speciesColors[species] || speciesColors.passaro;
  const scl = stage === 2 ? 0.7 : stage === 3 ? 0.85 : 1;

  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 140 150" style={{ animation: `${moodAnimations[mood]} 2.5s ease-in-out infinite` }}>
      <ellipse cx="70" cy="140" rx={20 * scl} ry="4" fill="rgba(0,0,0,0.08)" />
      {/* Tail feathers */}
      <path d={`M${90 * scl} 100 L${115 * scl} 80 L${110 * scl} 95 L${120 * scl} 85`} fill={colors.secondary} />
      {/* Body */}
      <ellipse cx="70" cy="100" rx={25 * scl} ry={30 * scl} fill={colors.primary} />
      <ellipse cx="70" cy="105" rx={17 * scl} ry={20 * scl} fill={colors.accent} />
      {/* Wing */}
      <ellipse cx={`${80 * scl}`} cy="90" rx={18 * scl} ry={12 * scl} fill={colors.secondary}
        transform={`rotate(-20, ${80 * scl}, 90)`}
        style={{ animation: (mood === 'energico' || mood === 'brincalhao') ? `${pulseAnim} 0.5s ease-in-out infinite` : 'none' }} />
      {/* Head */}
      <circle cx="60" cy="60" r={22 * scl} fill={colors.primary} />
      {/* Eyes */}
      {mood === 'sonolento' ? (
        <line x1={`${50 * scl}`} y1="58" x2={`${56 * scl}`} y2="58" stroke="#333" strokeWidth={scl * 2} strokeLinecap="round" />
      ) : (
        <>
          <circle cx={`${53 * scl}`} cy="57" r={4 * scl} fill="#333" />
          <circle cx={`${51 * scl}`} cy="55" r={1.5 * scl} fill="white" />
        </>
      )}
      {/* Beak */}
      <polygon points={`${72 * scl},55 ${88 * scl},60 ${72 * scl},63`} fill={colors.nose} />
      {mood === 'com_fome' && <polygon points={`${72 * scl},57 ${85 * scl},60 ${72 * scl},63`} fill="#F44336" />}
      {/* Cheek */}
      <ellipse cx={`${66 * scl}`} cy="65" rx={4 * scl} ry={2.5 * scl} fill="#FFAB91" opacity="0.5" />
      {/* Feet */}
      <line x1={`${60 * scl}`} y1="125" x2={`${55 * scl}`} y2="138" stroke={colors.nose} strokeWidth={scl * 2} />
      <line x1={`${80 * scl}`} y1="125" x2={`${85 * scl}`} y2="138" stroke={colors.nose} strokeWidth={scl * 2} />
      <line x1={`${50 * scl}`} y1="138" x2={`${60 * scl}`} y2="138" stroke={colors.nose} strokeWidth={scl * 2} />
      <line x1={`${80 * scl}`} y1="138" x2={`${90 * scl}`} y2="138" stroke={colors.nose} strokeWidth={scl * 2} />
      {/* Crown */}
      {stage === 4 && (
        <g transform="translate(45, 28)">
          <polygon points="15,0 0,12 3,4 0,15 15,8 30,15 27,4 30,12" fill="#FFD700" stroke="#FFA000" strokeWidth="1" />
        </g>
      )}
    </svg>
  );
};

// TURTLE SVG (Stages 2-4)
const TurtleSVG = ({ species, mood, stage, size }) => {
  const colors = speciesColors[species] || speciesColors.tartaruga;
  const scl = stage === 2 ? 0.7 : stage === 3 ? 0.85 : 1;

  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 140 150" style={{ animation: `${moodAnimations[mood]} 3.5s ease-in-out infinite` }}>
      <ellipse cx="70" cy="138" rx={30 * scl} ry="4" fill="rgba(0,0,0,0.08)" />
      {/* Legs */}
      <ellipse cx={`${35 * scl}`} cy="115" rx={12 * scl} ry={8 * scl} fill={colors.primary} />
      <ellipse cx={`${105 * scl}`} cy="115" rx={12 * scl} ry={8 * scl} fill={colors.primary} />
      <ellipse cx={`${42 * scl}`} cy="128" rx={8 * scl} ry={5 * scl} fill={colors.primary} />
      <ellipse cx={`${98 * scl}`} cy="128" rx={8 * scl} ry={5 * scl} fill={colors.primary} />
      {/* Shell */}
      <ellipse cx="70" cy="90" rx={38 * scl} ry={35 * scl} fill={colors.secondary} />
      {/* Shell pattern */}
      <ellipse cx="70" cy="85" rx={25 * scl} ry={22 * scl} fill={colors.primary} />
      <line x1="70" y1="63" x2="70" y2="107" stroke={colors.secondary} strokeWidth={scl * 1.5} />
      <line x1="45" y1="85" x2="95" y2="85" stroke={colors.secondary} strokeWidth={scl * 1.5} />
      <path d="M55 70 Q70 65 85 70" stroke={colors.secondary} strokeWidth={scl * 1} fill="none" />
      <path d="M55 100 Q70 105 85 100" stroke={colors.secondary} strokeWidth={scl * 1} fill="none" />
      {/* Head */}
      <circle cx="70" cy="55" r={18 * scl} fill={colors.primary} />
      {/* Eyes */}
      {mood === 'sonolento' ? (
        <>
          <line x1={`${60 * scl}`} y1="52" x2={`${66 * scl}`} y2="52" stroke="#333" strokeWidth={scl * 2} strokeLinecap="round" />
          <line x1={`${74 * scl}`} y1="52" x2={`${80 * scl}`} y2="52" stroke="#333" strokeWidth={scl * 2} strokeLinecap="round" />
        </>
      ) : mood === 'energico' ? (
        <>
          <circle cx={`${63 * scl}`} cy="52" r={4 * scl} fill="#333" />
          <circle cx={`${77 * scl}`} cy="52" r={4 * scl} fill="#333" />
          <circle cx={`${61 * scl}`} cy="50" r={2 * scl} fill="white" />
          <circle cx={`${75 * scl}`} cy="50" r={2 * scl} fill="white" />
        </>
      ) : (
        <>
          <circle cx={`${63 * scl}`} cy="52" r={3.5 * scl} fill="#333" />
          <circle cx={`${77 * scl}`} cy="52" r={3.5 * scl} fill="#333" />
          <circle cx={`${62 * scl}`} cy="51" r={1.2 * scl} fill="white" />
          <circle cx={`${76 * scl}`} cy="51" r={1.2 * scl} fill="white" />
        </>
      )}
      {/* Smile */}
      {mood === 'feliz' && <path d={`M64 ${60 * scl} Q70 ${65 * scl} 76 ${60 * scl}`} stroke="#333" strokeWidth={scl * 1.5} fill="none" />}
      {mood === 'com_fome' && <ellipse cx="70" cy={62 * scl} rx={3 * scl} ry={2.5 * scl} fill="#333" />}
      {/* Crown */}
      {stage === 4 && (
        <g transform="translate(55, 25)">
          <polygon points="15,0 0,12 3,4 0,15 15,8 30,15 27,4 30,12" fill="#FFD700" stroke="#FFA000" strokeWidth="1" />
        </g>
      )}
    </svg>
  );
};

// Speech bubble component
const SpeechBubble = ({ text, visible }) => {
  if (!visible) return null;
  return (
    <Box sx={{
      position: 'relative', background: 'white', borderRadius: 3, px: 2.5, py: 1.5,
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)', mb: 1, maxWidth: 260, mx: 'auto',
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

// Main Pet Animation Component
const PetAnimation = ({ species, mood = 'feliz', evolutionStage = 1, size = 180, onInteract, excited }) => {
  const [hearts, setHearts] = useState(false);
  const [sparkles, setSparkles] = useState(false);
  const [showSpeech, setShowSpeech] = useState(true);

  useEffect(() => { setShowSpeech(true); }, [evolutionStage]);

  const handleTap = useCallback(() => {
    setHearts(true);
    setSparkles(true);
    setTimeout(() => setHearts(false), 1200);
    setTimeout(() => setSparkles(false), 2000);
    if (onInteract) onInteract();
  }, [onInteract]);

  useEffect(() => {
    if (excited) {
      setSparkles(true);
      setTimeout(() => setSparkles(false), 2000);
    }
  }, [excited]);

  const renderPet = () => {
    if (evolutionStage === 1) {
      return <EggSVG species={species} mood={mood} size={size} />;
    }
    switch (species) {
      case 'gato': return <CatSVG species={species} mood={mood} stage={evolutionStage} size={size} />;
      case 'cao': return <DogSVG species={species} mood={mood} stage={evolutionStage} size={size} />;
      case 'passaro': return <BirdSVG species={species} mood={mood} stage={evolutionStage} size={size} />;
      case 'tartaruga': return <TurtleSVG species={species} mood={mood} stage={evolutionStage} size={size} />;
      default: return <CatSVG species={species} mood={mood} stage={evolutionStage} size={size} />;
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
          animation: stageGlow ? `${glowAnim} 3s ease-in-out infinite` : 'none',
          transition: 'transform 0.1s',
          '&:active': { transform: 'scale(0.95)' }
        }}
      >
        <HeartParticles show={hearts} />
        <SparkleEffect show={sparkles} />
        <ZzzEffect show={mood === 'sonolento'} />
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
