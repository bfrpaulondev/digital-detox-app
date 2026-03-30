import React from 'react';
import { Box, Typography } from '@mui/material';
import EmojiEvents from '@mui/icons-material/EmojiEvents';

const PointsDisplay = ({ points, level, streak, size = 'medium' }) => {
  const sizes = {
    small: { icon: 20, font: 'body2', levelFont: 'caption' },
    medium: { icon: 28, font: 'h6', levelFont: 'body2' },
    large: { icon: 40, font: 'h4', levelFont: 'h6' }
  };
  const s = sizes[size];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <EmojiEvents sx={{ color: '#FFD700', fontSize: s.icon }} />
      <Box>
        <Typography variant={s.font} sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
          {points || 0} pts
        </Typography>
        <Typography variant={s.levelFont} sx={{ color: 'text.secondary', lineHeight: 1 }}>
          Nível {level || 1} {streak ? `• ${streak}🔥` : ''}
        </Typography>
      </Box>
    </Box>
  );
};

export default PointsDisplay;
