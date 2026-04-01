import React from 'react';
import { Avatar, Box } from '@mui/material';

const petEmojis = {
  gato: '🐱', cao: '🐶', passaro: '🐦', tartaruga: '🐢'
};

export const speciesColors = {
  gato: { primary: '#A1887F', secondary: '#8D6E63', accent: '#EFEBE9', nose: '#5D4037', iris: '#795548' },
  cao: { primary: '#FFB74D', secondary: '#FF9800', accent: '#FFF3E0', nose: '#F48FB1', iris: '#FF8F00' },
  passaro: { primary: '#64B5F6', secondary: '#42A5F5', accent: '#E3F2FD', nose: '#FFB74D', iris: '#1E88E5' },
  tartaruga: { primary: '#81C784', secondary: '#66BB6A', accent: '#E8F5E9', nose: '#388E3C', iris: '#2E7D32' }
};

const moodColors = {
  feliz: '#A5D6A7',
  triste: '#B0BEC5',
  sonolento: '#CE93D8',
  energico: '#FFCC80',
  com_fome: '#EF9A9A',
  brincalhao: '#90CAF9',
  doente: '#C5E1A5'
};

const evolutionStages = ['🥚', '🐣', '🐾', '👑'];

const PetAvatar = ({ species, mood, evolutionStage, size = 60 }) => {
  const emoji = petEmojis[species] || '🐾';
  const sc = speciesColors[species] || speciesColors.gato;
  const moodColor = moodColors[mood] || '#B39DDB';
  const bgColor = sc.accent;
  const borderColor = mood === 'feliz' || mood === 'brincalhao'
    ? sc.primary
    : moodColor;
  const stage = evolutionStages[(evolutionStage || 1) - 1] || '🥚';

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <Avatar
        sx={{
          width: size, height: size,
          bgcolor: `${bgColor}`,
          fontSize: size * 0.5,
          border: `3px solid ${borderColor}`,
          transition: 'all 0.3s ease',
          animation: 'petAvatarBounce 2s ease-in-out infinite'
        }}
      >
        {emoji}
      </Avatar>
      <Box sx={{
        position: 'absolute', top: -4, right: -4,
        fontSize: size * 0.25, bgcolor: 'background.paper',
        borderRadius: '50%', p: 0.2, boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        {stage}
      </Box>
    </Box>
  );
};

export default PetAvatar;
export { petEmojis, moodColors };
