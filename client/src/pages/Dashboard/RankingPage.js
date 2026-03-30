import React, { useState, useEffect } from 'react';
import {
  Box, Typography, List, ListItem, ListItemIcon, ListItemText,
  Avatar, Chip, Paper, Divider, MenuItem, TextField, InputAdornment
} from '@mui/material';
import { EmojiEvents, Search } from '@mui/icons-material';
import AppHeader from '../../components/layout/AppHeader';
import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const RankingPage = () => {
  const { user } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRanking();
  }, [grade]);

  const loadRanking = async () => {
    try {
      const params = {};
      if (grade) params.grade = grade;
      const res = await dashboardAPI.getRanking(params);
      setRanking(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (position) => {
    switch (position) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return 'text.secondary';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      <AppHeader title="Ranking" showBack showProfile={false} />

      <Box sx={{ px: 2, pt: 2 }}>
        {/* Filter */}
        <TextField
          select
          fullWidth
          label="Filtrar por Ano"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          sx={{ mb: 2 }}
          size="small"
        >
          <MenuItem value="">Todos</MenuItem>
          {[5,6,7,8,9,10,11,12].map(g => (
            <MenuItem key={g} value={String(g)}>{g}.º ano</MenuItem>
          ))}
        </TextField>

        {/* Top 3 */}
        {ranking.length >= 3 && (
          <Paper sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: '#FFF8E1' }}>
            <EmojiEvents sx={{ fontSize: 48, color: '#FFD700', mb: 1 }} />
            <Typography variant="h5" fontWeight={800}>
              {ranking[0].fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {ranking[0].grade}º ano • {ranking[0].totalPoints} pts
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
              {ranking.slice(0, 3).map((student, i) => (
                <Box key={student._id} sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: i === 0 ? 56 : 40,
                      height: i === 0 ? 56 : 40,
                      bgcolor: 'primary.main',
                      mx: 'auto',
                      mb: 0.5,
                      border: i === 0 ? '3px solid #FFD700' : 'none'
                    }}
                  >
                    {student.fullName?.charAt(0)}
                  </Avatar>
                  <Typography variant="caption" fontWeight={600}>{i + 1}º</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {/* Full ranking list */}
        <List>
          {ranking.map((student) => (
            <ListItem
              key={student._id}
              sx={{
                bgcolor: student.isCurrentUser ? '#E8EAF6' : 'transparent',
                borderRadius: 2,
                mb: 0.5,
                border: student.isCurrentUser ? '2px solid #6C63FF' : 'none'
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Typography variant="h6" fontWeight={800} sx={{ color: getMedalColor(student.position) }}>
                  {student.position}
                </Typography>
              </ListItemIcon>
              <Avatar sx={{ mr: 1.5, bgcolor: 'primary.light' }}>
                {student.fullName?.charAt(0)}
              </Avatar>
              <ListItemText
                primary={student.fullName}
                secondary={`${student.grade}º ano`}
                primaryTypographyProps={{ fontWeight: student.isCurrentUser ? 700 : 500 }}
              />
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" fontWeight={700} color="primary.main">
                  {student.totalPoints} pts
                </Typography>
                {student.currentStreak > 0 && (
                  <Typography variant="caption">{student.currentStreak}🔥</Typography>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default RankingPage;
