import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, LinearProgress,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, Paper,
  Slider, TextField, Collapse
} from '@mui/material';
import {
  Pets as PetsIcon,
  Restaurant as FeedIcon,
  Favorite as HeartIcon,
  SportsEsports as PlayIcon,
  AutoAwesome as SparkleIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AppHeader from '../../components/layout/AppHeader';
import PetAnimation from '../../components/common/PetAnimation';
import { petAPI } from '../../services/api';

const speciesData = {
  gato: { name: 'Gato', emoji: '🐱' },
  cao: { name: 'Cão', emoji: '🐶' },
  passaro: { name: 'Pássaro', emoji: '🐦' },
  tartaruga: { name: 'Tartaruga', emoji: '🐢' }
};

const moodLabels = {
  feliz: 'Feliz 😊', triste: 'Triste 😢', sonolento: 'Sonolento 😴', energico: 'Energético ⚡',
  com_fome: 'Com fome 😫', brincalhao: 'Brincalhão 😄', doente: 'Doente 🤒'
};

const PetPage = () => {
  const { user, updateUser } = useAuth();
  const [pet, setPet] = useState(null);
  const [hasPet, setHasPet] = useState(false);
  const [adoptDialogOpen, setAdoptDialogOpen] = useState(false);
  const [feedDialogOpen, setFeedDialogOpen] = useState(false);
  const [feedPoints, setFeedPoints] = useState(5);
  const [newPet, setNewPet] = useState({ species: '', name: '' });
  const [loading, setLoading] = useState(true);
  const [excited, setExcited] = useState(false);
  const [interaction, setInteraction] = useState(null); // 'feed' | 'pet' | 'play' | null
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPet();
  }, []);

  const loadPet = async () => {
    try {
      const res = await petAPI.getMy();
      if (res.data.success) {
        setPet(res.data.data);
        setHasPet(true);
      }
    } catch (e) {
      setHasPet(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAdopt = async () => {
    try {
      const res = await petAPI.create(newPet);
      setPet(res.data.data);
      setHasPet(true);
      setAdoptDialogOpen(false);
      setMessage(`${newPet.name} foi adotado! Cuida bem dele!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFeed = async () => {
    try {
      const res = await petAPI.feed(feedPoints);
      setPet(res.data.data);
      setFeedDialogOpen(false);
      if (updateUser) {
        const updatedUser = { ...user, totalPoints: (user.totalPoints || 0) - feedPoints };
        updateUser(updatedUser);
      }
      setInteraction('feed');
      setExcited(true);
      setMessage(`${pet.name} foi alimentado! +${feedPoints} XP 🍖`);
      setTimeout(() => { setExcited(false); setInteraction(null); setMessage(''); }, 2500);
    } catch (e) {
      setMessage(e.response?.data?.message || 'Erro ao alimentar');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handlePet = () => {
    setInteraction('pet');
    setExcited(true);
    setMessage(`${pet.name} adorou! 💕`);
    setTimeout(() => { setExcited(false); setInteraction(null); setMessage(''); }, 2000);
  };

  const handlePlay = () => {
    setInteraction('play');
    setExcited(true);
    setMessage(`${pet.name} está a brincar! 🎮`);
    setTimeout(() => { setExcited(false); setInteraction(null); setMessage(''); }, 2500);
  };

  const StatBar = ({ label, value, icon, color, warning }) => (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" fontWeight={600}>
          {label}
          {warning && <Typography component="span" sx={{ ml: 0.5, fontSize: '0.7rem', color: '#F44336' }}>⚠️</Typography>}
        </Typography>
        <Typography variant="body2" color={value < 25 ? 'error' : 'text.secondary'} fontWeight={value < 25 ? 700 : 400}>
          {value}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 8, borderRadius: 4, bgcolor: '#E0E0E0',
          '& .MuiLinearProgress-bar': {
            bgcolor: value < 15 ? '#F44336' : value < 30 ? '#FF9800' : color,
            borderRadius: 4,
            transition: 'background-color 0.5s ease'
          }
        }}
      />
    </Box>
  );

  // No pet - show adoption screen
  if (!loading && !hasPet) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
        <AppHeader title="Animal Virtual" showBack showProfile={false} />
        <Box sx={{ px: 2, pt: 4, textAlign: 'center' }}>
          <Typography sx={{ fontSize: 80, mb: 2, animation: 'float 3s ease-in-out infinite' }}>🥚</Typography>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Adote o seu Animal Virtual!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, px: 2 }}>
            Escolha um companheiro para crescer contigo enquanto faz atividades offline.
            Alimente-o, brinque com ele e veja-o evoluir!
          </Typography>
          <Button variant="contained" size="large" onClick={() => setAdoptDialogOpen(true)}
            startIcon={<PetsIcon />} sx={{ px: 4, py: 1.5, borderRadius: 3, fontSize: 16 }}>
            Adotar Animal
          </Button>
        </Box>

        <Dialog open={adoptDialogOpen} onClose={() => setAdoptDialogOpen(false)} fullWidth
          sx={{ '& .MuiDialog-paper': { borderRadius: 3, mx: 2 } }}>
          <DialogTitle fontWeight={700}>Adotar Animal</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Escolha a espécie:</Typography>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {Object.entries(speciesData).map(([key, data]) => (
                <Grid item xs={6} key={key}>
                  <Paper
                    onClick={() => setNewPet(p => ({ ...p, species: key }))}
                    sx={{
                      p: 2, textAlign: 'center', cursor: 'pointer',
                      border: '2px solid',
                      borderColor: newPet.species === key ? 'primary.main' : 'grey.200',
                      borderRadius: 3, transition: 'all 0.2s',
                      '&:hover': { borderColor: 'primary.light', transform: 'scale(1.02)' }
                    }}
                  >
                    <Typography sx={{ fontSize: 40 }}>{data.emoji}</Typography>
                    <Typography variant="body2" fontWeight={600}>{data.name}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <TextField
              fullWidth label="Nome do animal" value={newPet.name}
              onChange={(e) => setNewPet(p => ({ ...p, name: e.target.value }))}
              inputProps={{ maxLength: 30 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setAdoptDialogOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleAdopt}
              disabled={!newPet.species || !newPet.name} sx={{ borderRadius: 2 }}>
              Adotar!
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Loading
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppHeader title="Animal Virtual" showBack showProfile={false} />
        <Typography textAlign="center" sx={{ py: 4 }}>A carregar...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      <AppHeader title="Animal Virtual" showBack showProfile={false} />

      <Box sx={{ px: 2, pt: 1 }}>
        {/* Pet Animation Display */}
        <Card sx={{
          mb: 2, textAlign: 'center', py: 3,
          background: pet?.evolutionStage >= 3
            ? 'linear-gradient(180deg, #FFF8E1 0%, #F3E5F5 50%, #FFFFFF 100%)'
            : 'linear-gradient(180deg, #FFF8E1 0%, #FFFFFF 100%)',
          borderRadius: 3, position: 'relative', overflow: 'visible'
        }}>
          <PetAnimation
            species={pet?.species}
            mood={pet?.mood}
            evolutionStage={pet?.evolutionStage}
            size={180}
            excited={excited}
            interaction={interaction}
          />

          <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
            {pet?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {speciesData[pet?.species]?.name} • {moodLabels[pet?.mood] || pet?.mood}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
            <Chip label={`Nível ${pet?.level}`} color="primary" size="small" />
            <Chip
              label={pet?.evolutionStage === 1 ? '🥚 Ovo' : pet?.evolutionStage === 2 ? '🐣 Bebé' : pet?.evolutionStage === 3 ? '🐾 Jovem' : '👑 Adulto'}
              variant="outlined" size="small"
              color={pet?.evolutionStage >= 3 ? 'secondary' : 'default'}
            />
          </Box>

          {/* Urgent care banner when stats are critical */}
          {(pet?.health < 30 || pet?.hunger < 20) && (
            <Paper
              sx={{
                mt: 2, mx: 1, p: 1.5, textAlign: 'center',
                bgcolor: pet?.health < 20 ? '#FFEBEE' : '#FFF3E0',
                borderRadius: 2,
                border: `1px solid ${pet?.health < 20 ? '#EF9A9A' : '#FFCC80'}`,
                animation: 'pulse 2s ease-in-out infinite'
              }}>
              <Typography variant="body2" fontWeight={600} color={pet?.health < 20 ? '#C62828' : '#E65100'}>
                {pet?.health < 20
                  ? `🚨 ${pet?.name} precisa de ajuda urgente! Alimenta-o!`
                  : `⚠️ ${pet?.name} está com muita fome! Não o esqueças!`
                }
              </Typography>
            </Paper>
          )}

          {/* Experience bar */}
          <Box sx={{ px: 4, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">XP</Typography>
              <Typography variant="caption" color="text.secondary">
                {pet?.experience} / {pet?.experienceToNextLevel}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={pet ? (pet.experience / pet.experienceToNextLevel) * 100 : 0}
              sx={{ height: 8, borderRadius: 4, mt: 0.5, bgcolor: '#E8EAF6' }}
            />
          </Box>
        </Card>

        {/* Action message */}
        <Collapse in={!!message}>
          <Paper sx={{
            mb: 2, p: 1.5, textAlign: 'center', bgcolor: '#E8F5E9', borderRadius: 2,
            border: '1px solid #A5D6A7'
          }}>
            <Typography variant="body2" fontWeight={600} color="#2E7D32">{message}</Typography>
          </Paper>
        </Collapse>

        {/* Stats */}
        <Card sx={{ mb: 2, borderRadius: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Estado do {pet?.name}
            </Typography>
            <StatBar label="Fome" value={pet?.hunger || 0} color="#FF9800" warning={(pet?.hunger || 0) < 30} />
            <StatBar label="Felicidade" value={pet?.happiness || 0} color="#E91E63" warning={(pet?.happiness || 0) < 30} />
            <StatBar label="Energia" value={pet?.energy || 0} color="#2196F3" warning={(pet?.energy || 0) < 25} />
            <StatBar label="Saúde" value={pet?.health || 0} color="#4CAF50" warning={(pet?.health || 0) < 30} />
          </CardContent>
        </Card>

        {/* Actions */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Button
              variant="contained" fullWidth size="large"
              startIcon={<FeedIcon />}
              onClick={() => setFeedDialogOpen(true)}
              sx={{
                py: 2, borderRadius: 3, flexDirection: 'column',
                bgcolor: '#FF9800', '&:hover': { bgcolor: '#F57C00' },
                minHeight: 80
              }}
            >
              <Typography variant="caption">Alimentar</Typography>
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained" fullWidth size="large"
              startIcon={<HeartIcon />}
              onClick={handlePet}
              sx={{
                py: 2, borderRadius: 3, flexDirection: 'column',
                bgcolor: '#E91E63', '&:hover': { bgcolor: '#C2185B' },
                minHeight: 80
              }}
            >
              <Typography variant="caption">Acariciar</Typography>
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained" fullWidth size="large"
              startIcon={<PlayIcon />}
              onClick={handlePlay}
              sx={{
                py: 2, borderRadius: 3, flexDirection: 'column',
                bgcolor: '#2196F3', '&:hover': { bgcolor: '#1976D2' },
                minHeight: 80
              }}
            >
              <Typography variant="caption">Brincar</Typography>
            </Button>
          </Grid>
        </Grid>

        {/* Evolution Guide */}
        <Card sx={{ mb: 2, borderRadius: 3, bgcolor: '#F3E5F5' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <SparkleIcon sx={{ color: '#9C27B0' }} />
              <Typography variant="h6" fontWeight={700}>Evolução</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {[
                { stage: 1, label: '🥚 Ovo', level: 'Início' },
                { stage: 2, label: '🐣 Bebé', level: 'Nv.5' },
                { stage: 3, label: '🐾 Jovem', level: 'Nv.10' },
                { stage: 4, label: '👑 Adulto', level: 'Nv.15' }
              ].map((s, i, arr) => (
                <React.Fragment key={s.stage}>
                  <Box sx={{
                    textAlign: 'center', opacity: (pet?.evolutionStage || 1) >= s.stage ? 1 : 0.4,
                    transition: 'opacity 0.3s'
                  }}>
                    <Typography sx={{ fontSize: 24 }}>{s.label.split(' ')[0]}</Typography>
                    <Typography variant="caption" fontWeight={600}>{s.label.split(' ')[1]}</Typography>
                    <Typography variant="caption" display="block" color="text.secondary">{s.level}</Typography>
                  </Box>
                  {i < arr.length - 1 && (
                    <Box sx={{
                      flex: 1, height: 2, mx: 0.5,
                      bgcolor: (pet?.evolutionStage || 1) > s.stage ? '#9C27B0' : '#E0E0E0',
                      borderRadius: 1
                    }} />
                  )}
                </React.Fragment>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Info */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Informações</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">Vezes alimentado</Typography>
              <Typography variant="body2" fontWeight={600}>{pet?.feedCount || 0}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">Pontos gastou</Typography>
              <Typography variant="body2" fontWeight={600}>{pet?.totalPointsSpent || 0}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Última refeição</Typography>
              <Typography variant="body2" fontWeight={600}>
                {pet?.lastFed ? new Date(pet.lastFed).toLocaleDateString('pt-PT') : '-'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Feed Dialog */}
      <Dialog open={feedDialogOpen} onClose={() => setFeedDialogOpen(false)} fullWidth maxWidth="xs"
        hideBackdrop={false}
        sx={{ '& .MuiDialog-paper': { borderRadius: 3, mx: 2 } }}>
        <DialogTitle fontWeight={700}>Alimentar {pet?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use os seus pontos ({user?.totalPoints || 0} disponíveis) para alimentar {pet?.name}.
            Cada ponto dá XP e aumenta a fome!
          </Typography>
          <Typography variant="h6" textAlign="center" sx={{ mb: 1, color: 'primary.main' }}>
            {feedPoints} pontos
          </Typography>
          <Slider
            value={feedPoints}
            onChange={(_, v) => setFeedPoints(v)}
            min={1}
            max={Math.min(50, user?.totalPoints || 1)}
            marks={[{ value: 1, label: '1' }, { value: 25, label: '25' }, { value: 50, label: '50' }]}
            valueLabelDisplay="auto"
            sx={{ color: '#FF9800' }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setFeedDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleFeed}
            disabled={feedPoints > (user?.totalPoints || 0)}
            sx={{ bgcolor: '#FF9800', '&:hover': { bgcolor: '#F57C00' }, borderRadius: 2 }}>
            Alimentar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PetPage;
