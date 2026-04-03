import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Chip, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText,
  Avatar
} from '@mui/material';
import {
  School as SchoolIcon,
  Pets as PetsIcon,
  NaturePeople as OutsideIcon,
  EmojiEvents as EmojiEventsIcon,
  CameraAlt as CameraIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AppHeader from '../../components/layout/AppHeader';
import PointsDisplay from '../../components/common/PointsDisplay';
import PetAvatar from '../../components/common/PetAvatar';
import { dashboardAPI, activityAPI, aiAPI } from '../../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const loadDashboard = async () => {
    try {
      // Load stats first (critical)
      let statsData = null;
      try {
        const statsRes = await dashboardAPI.getStats();
        statsData = statsRes.data.data;
      } catch (statsError) {
        console.error('Stats error:', statsError);
        // Provide fallback stats from user data
        statsData = {
          totalPoints: user?.totalPoints || 0,
          level: user?.level || 1,
          currentStreak: user?.currentStreak || 0,
          longestStreak: user?.longestStreak || 0,
          completedActivities: 0,
          pendingActivities: 0,
          pet: null,
          achievementCount: 0
        };
      }
      setStats(statsData);

      // Load activities (non-critical)
      try {
        await activityAPI.getAll({ status: 'pendente', limit: 5 });
      } catch (e) {
        // Silently ignore activity load failure
      }

      // AI suggestions (non-critical)
      if (user?.role === 'student' && user?.activityPreferences?.length > 0) {
        try {
          const sugRes = await aiAPI.getSuggestions({ preferences: user.activityPreferences });
          setSuggestions(sugRes.data.data?.suggestions || []);
        } catch (e) {
          setSuggestions([
            { title: 'Passeio ao ar livre', description: 'Faça um passeio de 30 minutos', estimatedMinutes: 30, pointsValue: 15 },
            { title: 'Leitura', description: 'Leia um livro por 20 minutos', estimatedMinutes: 20, pointsValue: 10 },
            { title: 'Desenho', description: 'Desenhe algo que veja à sua volta', estimatedMinutes: 25, pointsValue: 12 }
          ]);
        }
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StudentDashboard = () => (
    <>
      {/* Welcome Card */}
      <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', color: 'white' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Olá, {user?.fullName?.split(' ')[0]}! 👋
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            {user?.currentStreak > 0
              ? `${user.currentStreak} dia(s) seguido(s) de atividades! 🔥`
              : 'Comece hoje a tua jornada offline!'
            }
          </Typography>
          <Box sx={{ mt: 2 }}>
            <PointsDisplay points={stats?.totalPoints || user?.totalPoints} level={stats?.level || user?.level} streak={stats?.currentStreak || user?.currentStreak} size="medium" />
          </Box>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={4}>
          <Card sx={{ textAlign: 'center', p: 1.5 }}>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {stats?.completedActivities || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">Atividades</Typography>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ textAlign: 'center', p: 1.5 }}>
            <Typography variant="h4" fontWeight={700} color="secondary.main">
              {stats?.pendingActivities || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">Pendentes</Typography>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ textAlign: 'center', p: 1.5 }}>
            <Typography variant="h4" fontWeight={700} color="success.main">
              {stats?.achievementCount || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">Conquistas</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Pet Card */}
      {stats?.pet && (
        <Card sx={{ mb: 2 }} onClick={() => navigate('/pet')}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PetAvatar species={stats.pet.species} mood={stats.pet.mood} evolutionStage={stats.pet.evolutionStage} size={60} />
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={600}>{stats.pet.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Nível {stats.pet.level} • {stats.pet.mood === 'feliz' ? '😊' : '😐'}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={20}
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
            </Box>
            <Typography variant="caption" color="primary.main" fontWeight={600}>Ver →</Typography>
          </CardContent>
        </Card>
      )}

      {/* Quick Access */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Acesso Rápido</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={4}>
          <Card sx={{ textAlign: 'center', p: 2, cursor: 'pointer' }} onClick={() => navigate('/school')}>
            <SchoolIcon sx={{ fontSize: 32, color: '#2196F3' }} />
            <Typography variant="caption" fontWeight={600}>Escola</Typography>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ textAlign: 'center', p: 2, cursor: 'pointer' }} onClick={() => navigate('/pet')}>
            <PetsIcon sx={{ fontSize: 32, color: '#FF9800' }} />
            <Typography variant="caption" fontWeight={600}>Animal</Typography>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ textAlign: 'center', p: 2, cursor: 'pointer' }} onClick={() => navigate('/outside')}>
            <OutsideIcon sx={{ fontSize: 32, color: '#4CAF50' }} />
            <Typography variant="caption" fontWeight={600}>Fora</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* AI Activity Suggestions */}
      {suggestions.length > 0 && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Sugestões para Ti ✨
          </Typography>
          {suggestions.slice(0, 3).map((sug, i) => (
            <Card key={i} sx={{ mb: 1.5 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography fontWeight={600}>{sug.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{sug.description}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip size="small" label={`${sug.estimatedMinutes || 30} min`} variant="outlined" />
                      <Chip size="small" label={`${sug.pointsValue || 10} pts`} color="primary" />
                    </Box>
                  </Box>
                  <CameraIcon sx={{ color: 'text.secondary' }} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </>
      )}

      {/* Ranking Button */}
      <Card sx={{ mb: 2, bgcolor: '#FFF8E1', cursor: 'pointer' }} onClick={() => navigate('/ranking')}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
          <EmojiEventsIcon sx={{ fontSize: 32, color: '#FFD700' }} />
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={600}>Ranking da Escola</Typography>
            <Typography variant="body2" color="text.secondary">Ver a tua posição entre colegas</Typography>
          </Box>
          <Typography variant="caption" color="primary.main">→</Typography>
        </CardContent>
      </Card>
    </>
  );

  const TeacherDashboard = () => (
    <>
      <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', color: 'white' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={700}>Olá, Professor(a) {user?.fullName?.split(' ').pop()}!</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>Painel de gestão escolar</Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h3" fontWeight={700} color="primary.main">{stats?.totalStudents || 0}</Typography>
            <Typography variant="body2">Alunos</Typography>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h3" fontWeight={700} color="warning.main">{stats?.pendingValidations || 0}</Typography>
            <Typography variant="body2">Pendentes</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Top Students */}
      {stats?.topStudents?.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Top Alunos 🏆</Typography>
            <List dense>
              {stats.topStudents.slice(0, 5).map((student, i) => (
                <ListItem key={student._id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Typography fontWeight={700} color={i < 3 ? '#FFD700' : 'text.secondary'}>
                      {i + 1}º
                    </Typography>
                  </ListItemIcon>
                  <ListItemText primary={student.fullName} secondary={`${student.grade}º ano`} />
                  <Chip label={`${student.totalPoints || 0} pts`} size="small" color="primary" />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </>
  );

  const ParentDashboard = () => (
    <>
      <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', color: 'white' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={700}>Olá, {user?.fullName?.split(' ')[0]}!</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>Acompanhe o progresso dos seus filhos</Typography>
        </CardContent>
      </Card>

      {stats?.children?.map(child => (
        <Card key={child.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>{child.fullName?.charAt(0)}</Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600}>{child.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">{child.grade}º ano • {child.school}</Typography>
              </Box>
              <PointsDisplay points={child.totalPoints} level={child.level} size="small" />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="h5" fontWeight={700} color="primary.main">{child.completedActivities}</Typography>
                <Typography variant="caption" color="text.secondary">Atividades</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" fontWeight={700} color="secondary.main">{child.currentStreak}</Typography>
                <Typography variant="caption" color="text.secondary">Streak</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" fontWeight={700} color="success.main">Nv.{child.level}</Typography>
                <Typography variant="caption" color="text.secondary">Nível</Typography>
              </Grid>
            </Grid>
            {child.pet && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, p: 1, bgcolor: '#FFF8E1', borderRadius: 2 }}>
                <PetAvatar species={child.pet.species} mood={child.pet.mood} size={30} />
                <Typography variant="body2">{child.pet.name} - Nível {child.pet.level}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );

  const renderDashboard = () => {
    switch (user?.role) {
      case 'student': return <StudentDashboard />;
      case 'teacher': return <TeacherDashboard />;
      case 'parent': return <ParentDashboard />;
      default: return <StudentDashboard />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      <AppHeader showNotifications />
      <Box sx={{ px: 2, pt: 2 }}>
        {loading ? (
          <Typography textAlign="center" sx={{ py: 4 }}>A carregar...</Typography>
        ) : (
          renderDashboard()
        )}
      </Box>
    </Box>
  );
};

export default DashboardPage;
