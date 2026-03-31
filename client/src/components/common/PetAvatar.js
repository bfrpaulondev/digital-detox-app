import React, { useState } from 'react';
import { Avatar, Box } from '@mui/material';

const petEmojis = {
  gato: '🐱', cao: '🐶', passaro: '🐦', tartaruga: '🐢'
};

const moodColors = {
  feliz: '#4CAF50', triste: '#9E9E9E', sonolento: '#9C27B0',
  energico: '#FF9800', com_fome: '#F44336', brincalhao: '#2196F3'
};

const evolutionStages = ['🥚', '🐣', '🐾', '👑'];

const PetAvatar = ({ species, mood, evolutionStage, size = 60 }) => {
  const emoji = petEmojis[species] || '🐾';
  const bgColor = moodColors[mood] || '#6C63FF';
  const stage = evolutionStages[(evolutionStage || 1) - 1] || '🥚';

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <Avatar
        sx={{
          width: size, height: size,
          bgcolor: `${bgColor}15`,
          fontSize: size * 0.5,
          border: `3px solid ${bgColor}`,
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
