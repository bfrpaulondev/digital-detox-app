import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, LinearProgress,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, Paper,
  Slider, TextField
} from '@mui/material';
import {
  Pets as PetsIcon,
  Restaurant as FeedIcon,
  Favorite as HeartIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AppHeader from '../../components/layout/AppHeader';
import PetAvatar from '../../components/common/PetAvatar';
import { petAPI } from '../../services/api';

const speciesData = {
  gato: { name: 'Gato', emoji: '🐱' },
  cao: { name: 'Cão', emoji: '🐶' },
  passaro: { name: 'Pássaro', emoji: '🐦' },
  tartaruga: { name: 'Tartaruga', emoji: '🐢' }
};

const moodEmojis = {
  feliz: '😊', triste: '😢', sonolento: '😴', energico: '⚡',
  com_fome: '😫', brincalhao: '😄'
};

const PetPage = () => {
  const { user } = useAuth();
  const [pet, setPet] = useState(null);
  const [hasPet, setHasPet] = useState(false);
  const [adoptDialogOpen, setAdoptDialogOpen] = useState(false);
  const [feedDialogOpen, setFeedDialogOpen] = useState(false);
  const [feedPoints, setFeedPoints] = useState(5);
  const [newPet, setNewPet] = useState({ species: '', name: '' });
  const [loading, setLoading] = useState(true);

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
    } catch (e) {
      console.error(e);
    }
  };

  const handleFeed = async () => {
    try {
      const res = await petAPI.feed(feedPoints);
      setPet(res.data.data);
      setFeedDialogOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const StatBar = ({ label, value, icon, color }) => (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" fontWeight={600}>{label}</Typography>
        <Typography variant="body2" color="text.secondary">{value}%</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: '#E0E0E0',
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
            borderRadius: 4
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
        <Box sx={{ px: 2, pt: 3, textAlign: 'center' }}>
          <PetsIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Adote o seu Animal Virtual!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Escolha um companheiro para crescer contigo enquanto faz atividades offline.
          </Typography>
          <Button variant="contained" size="large" onClick={() => setAdoptDialogOpen(true)} startIcon={<PetsIcon />}>
            Adotar Animal
          </Button>
        </Box>

        <Dialog open={adoptDialogOpen} onClose={() => setAdoptDialogOpen(false)} fullWidth>
          <DialogTitle>Adotar Animal</DialogTitle>
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
                      borderRadius: 3
                    }}
                  >
                    <Typography sx={{ fontSize: 40 }}>{data.emoji}</Typography>
                    <Typography variant="body2" fontWeight={600}>{data.name}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <TextField
              fullWidth
              label="Nome do animal"
              value={newPet.name}
              onChange={(e) => setNewPet(p => ({ ...p, name: e.target.value }))}
              inputProps={{ maxLength: 30 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAdoptDialogOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleAdopt} disabled={!newPet.species || !newPet.name}>
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

      <Box sx={{ px: 2, pt: 2 }}>
        {/* Pet Display */}
        <Card sx={{ mb: 2, textAlign: 'center', py: 4, background: 'linear-gradient(180deg, #FFF8E1 0%, #FFFFFF 100%)' }}>
          <PetAvatar species={pet.species} mood={pet.mood} evolutionStage={pet.evolutionStage} size={100} />
          <Typography variant="h4" fontWeight={800} sx={{ mt: 2 }}>{pet.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {speciesData[pet.species]?.name} • {moodEmojis[pet.mood]} {pet.mood}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
            <Chip label={`Nível ${pet.level}`} color="primary" />
            <Chip label={pet.evolutionStage === 1 ? 'Ovo' : pet.evolutionStage === 2 ? 'Bebé' : pet.evolutionStage === 3 ? 'Jovem' : 'Adulto'} variant="outlined" />
          </Box>

          {/* Experience bar */}
          <Box sx={{ px: 4, mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              XP: {pet.experience} / {pet.experienceToNextLevel}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(pet.experience / pet.experienceToNextLevel) * 100}
              sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
            />
          </Box>
        </Card>

        {/* Stats */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Estado do {pet.name}</Typography>
            <StatBar label="Fome" value={pet.hunger} color="#FF9800" />
            <StatBar label="Felicidade" value={pet.happiness} color="#E91E63" />
            <StatBar label="Energia" value={pet.energy} color="#2196F3" />
            <StatBar label="Saúde" value={pet.health} color="#4CAF50" />
          </CardContent>
        </Card>

        {/* Actions */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<FeedIcon />}
              onClick={() => setFeedDialogOpen(true)}
              sx={{ py: 2 }}
            >
              Alimentar
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<HeartIcon />}
              sx={{ py: 2 }}
            >
              Acariciar
            </Button>
          </Grid>
        </Grid>

        {/* Info */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Informações</Typography>
            <Typography variant="body2" color="text.secondary">
              Vezes alimentado: {pet.feedCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pontos gastos: {pet.totalPointsSpent}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Última alimentação: {pet.lastFed ? new Date(pet.lastFed).toLocaleDateString('pt-PT') : '-'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Feed Dialog */}
      <Dialog open={feedDialogOpen} onClose={() => setFeedDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Alimentar {pet.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use os seus pontos ({user?.totalPoints || 0} disponíveis) para alimentar o seu animal.
          </Typography>
          <Typography variant="h6" textAlign="center" sx={{ mb: 1 }}>
            {feedPoints} pontos
          </Typography>
          <Slider
            value={feedPoints}
            onChange={(_, v) => setFeedPoints(v)}
            min={1}
            max={Math.min(50, user?.totalPoints || 1)}
            marks
            valueLabelDisplay="auto"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleFeed}
            disabled={feedPoints > (user?.totalPoints || 0)}
          >
            Alimentar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PetPage;
