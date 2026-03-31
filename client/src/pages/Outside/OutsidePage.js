import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Tabs, Tab,
  Chip, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Paper, InputAdornment, LinearProgress
} from '@mui/material';
import {
  NaturePeople as OutsideIcon,
  Add as AddIcon,
  CameraAlt as CameraIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Restaurant as MealIcon,
  Bedtime as SleepIcon,
  FamilyRestroom as FamilyIcon,
  Lightbulb as TipIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import AppHeader from '../../components/layout/AppHeader';
import { activityAPI, aiAPI, photoAPI } from '../../services/api';

const OutsidePage = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState(0);
  const [activities, setActivities] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    setActivities([]);
    setSuggestions([]);
    try {
      if (tab === 0) {
        const res = await activityAPI.getAll({ section: 'fora_escola' });
        setActivities(res.data?.data || []);
      } else if (tab === 1) {
        if (user?.activityPreferences?.length > 0) {
          try {
            const res = await aiAPI.getSuggestions({ preferences: user.activityPreferences });
            setSuggestions(res.data?.data?.suggestions || []);
          } catch (e) {
            setSuggestions([
              { title: 'Passeio', description: 'Faça um passeio de 30 minutos', estimatedMinutes: 30, pointsValue: 15, requiresPhoto: true },
              { title: 'Leitura', description: 'Leia por 20 minutos', estimatedMinutes: 20, pointsValue: 10, requiresPhoto: true },
              { title: 'Desenho', description: 'Desenhe algo à sua volta', estimatedMinutes: 25, pointsValue: 12, requiresPhoto: true }
            ]);
          }
        } else {
          setSuggestions([
            { title: 'Passeio', description: 'Faça um passeio de 30 minutos', estimatedMinutes: 30, pointsValue: 15, requiresPhoto: true },
            { title: 'Leitura', description: 'Leia por 20 minutos', estimatedMinutes: 20, pointsValue: 10, requiresPhoto: true },
            { title: 'Desenho', description: 'Desenhe algo à sua volta', estimatedMinutes: 25, pointsValue: 12, requiresPhoto: true }
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) return;
    setUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(photoFile);
      });

      const uploadRes = await photoAPI.upload({ photo: base64, activityId: selectedActivity?._id, originalName: photoFile.name });

      if (uploadRes.data.success) {
        enqueueSnackbar('Foto enviada com sucesso!', { variant: 'success' });
        setPhotoDialogOpen(false);
        setPhotoFile(null);
        setPhotoPreview(null);
        setAiResult(null);
        loadData();
      }
    } catch (e) {
      enqueueSnackbar('Erro ao enviar foto', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const StudentView = () => (
    <>
      <Card sx={{ mb: 2, bgcolor: '#E8F5E9' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
          <TipIcon sx={{ fontSize: 32, color: '#4CAF50' }} />
          <Box>
            <Typography fontWeight={600} color="#2E7D32">Dica do dia</Typography>
            <Typography variant="body2" color="#388E3C">Tente passar pelo menos 1 hora sem olhar para ecrãs hoje!</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Tab 0: Activities */}
      {tab === 0 && (
        <>
          <Card sx={{ mb: 2, cursor: 'pointer', border: '2px dashed', borderColor: 'primary.light' }} onClick={() => {
            setSelectedActivity({ title: 'Atividade Livre', description: 'Prove que fez uma atividade offline', category: 'social', section: 'fora_escola', pointsValue: 10, requiresPhoto: true });
            setPhotoDialogOpen(true);
          }}>
            <CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
              <CameraIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2" color="primary.main" fontWeight={600}>Registrar atividade com foto</Typography>
            </CardContent>
          </Card>

          {loading ? (
            <Typography textAlign="center" sx={{ py: 4 }} color="text.secondary">A carregar...</Typography>
          ) : activities.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <OutsideIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
              <Typography fontWeight={600} color="text.secondary">Sem atividades</Typography>
              <Typography variant="body2" color="text.secondary">Clica no botão acima para registar uma atividade com foto!</Typography>
            </Paper>
          ) : (
            activities.filter(a => a.title?.toLowerCase().includes(searchQuery.toLowerCase())).map(activity => (
              <Card key={activity._id} sx={{ mb: 1.5 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography fontWeight={600}>{activity.title}</Typography>
                  {activity.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{activity.description}</Typography>}
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                    <Chip size="small" label={activity.category} variant="outlined" />
                    <Chip size="small" label={`${activity.pointsValue} pts`} color="primary" />
                  </Box>
                  {activity.status === 'pendente' && (
                    <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                      <Button variant="contained" size="small" startIcon={<CheckIcon />}
                        onClick={() => activityAPI.complete(activity._id).then(() => loadData()).catch(console.error)}>Concluir</Button>
                      {activity.requiresPhoto && (
                        <Button variant="outlined" size="small" startIcon={<CameraIcon />}
                          onClick={() => { setSelectedActivity(activity); setPhotoDialogOpen(true); }}>Provar</Button>
                      )}
                    </Box>
                  )}
                  {activity.status === 'concluida' && <Chip label="Concluída" color="info" size="small" sx={{ mt: 1 }} />}
                  {activity.status === 'validada' && <Chip label="Validada" color="success" size="small" sx={{ mt: 1 }} />}
                </CardContent>
              </Card>
            ))
          )}
        </>
      )}

      {/* Tab 1: Suggestions */}
      {tab === 1 && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Sugestões Personalizadas ✨</Typography>
          {suggestions.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <LightbulbIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
              <Typography fontWeight={600} color="text.secondary">Sem sugestões</Typography>
              <Typography variant="body2" color="text.secondary">Define as tuas preferências no perfil para receber sugestões!</Typography>
            </Paper>
          ) : suggestions.map((sug, i) => (
            <Card key={i} sx={{ mb: 1.5 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography fontWeight={600}>{sug.title}</Typography>
                <Typography variant="body2" color="text.secondary">{sug.description}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Chip size="small" label={`${sug.estimatedMinutes || 30} min`} variant="outlined" />
                    <Chip size="small" label={`${sug.pointsValue || 10} pts`} color="primary" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </>
      )}

      {/* Tab 2: Time Management */}
      {tab === 2 && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Gestão de Tempo</Typography>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TimeIcon sx={{ color: 'primary.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>Tempo de Ecrã</Typography>
                  <Typography variant="body2" color="text.secondary">Limite diário: {user?.maxScreenTimeHours || 4}h</Typography>
                </Box>
              </Box>
              <LinearProgress variant="determinate" value={30} sx={{ height: 10, borderRadius: 5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>~1h 30min utilizadas hoje</Typography>
            </CardContent>
          </Card>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SleepIcon sx={{ color: '#9C27B0' }} />
                <Box>
                  <Typography fontWeight={600}>Hora de Dormir</Typography>
                  <Typography variant="body2" color="text.secondary">{user?.sleepTime || '22:00'}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MealIcon sx={{ color: '#FF9800' }} />
                <Box>
                  <Typography fontWeight={600}>Horário de Refeições</Typography>
                  <Typography variant="body2" color="text.secondary">Definido pela escola e família</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FamilyIcon sx={{ color: '#4CAF50' }} />
                <Box>
                  <Typography fontWeight={600}>Tempo em Família</Typography>
                  <Typography variant="body2" color="text.secondary">Definido pelos pais</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ mb: 2, bgcolor: '#FFF8E1' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingIcon sx={{ color: '#FF9800' }} />
                <Box>
                  <Typography fontWeight={600}>Estatísticas Semanais</Typography>
                  <Typography variant="body2" color="text.secondary">0 atividades esta semana • 0 pontos ganhos</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );

  const ParentView = () => (
    <>
      <Card sx={{ mb: 2, bgcolor: '#E8F5E9' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
          <FamilyIcon sx={{ fontSize: 32, color: '#4CAF50' }} />
          <Box>
            <Typography fontWeight={600}>Painel dos Pais</Typography>
            <Typography variant="body2" color="#388E3C">Acompanhe e defina as atividades dos seus filhos</Typography>
          </Box>
        </CardContent>
      </Card>
      {tab === 0 ? (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Definições dos Filhos</Typography>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <FamilyIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
            <Typography color="text.secondary">Nenhum filho vinculado. Use o código do filho para ligar a conta.</Typography>
          </Paper>
        </>
      ) : (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Atividades dos Filhos</Typography>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <StarIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
            <Typography color="text.secondary">As atividades completadas pelos filhos aparecerão aqui.</Typography>
          </Paper>
        </>
      )}
    </>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      <AppHeader title="Fora da Escola" showBack showProfile={false} />

      <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: 56, zIndex: 10 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{ '& .MuiTab-root': { minHeight: 56 } }}
        >
          {user?.role === 'parent' ? (
            <>
              <Tab label="Definições" icon={<OutsideIcon />} iconPosition="start" />
              <Tab label="Atividades" icon={<StarIcon />} iconPosition="start" />
            </>
          ) : (
            <>
              <Tab label="Atividades" icon={<CheckIcon />} iconPosition="start" />
              <Tab label="Sugestões" icon={<TipIcon />} iconPosition="start" />
              <Tab label="Tempo" icon={<TimeIcon />} iconPosition="start" />
            </>
          )}
        </Tabs>
      </Box>

      <Box sx={{ px: 2, pt: 2 }}>
        {user?.role === 'parent' ? <ParentView /> : <StudentView />}
      </Box>

      <Dialog open={photoDialogOpen} onClose={() => { setPhotoDialogOpen(false); setAiResult(null); setPhotoPreview(null); }} fullWidth maxWidth="sm">
        <DialogTitle>{aiResult ? 'Resultado da Análise' : 'Provar Atividade com Foto'}</DialogTitle>
        <DialogContent>
          {!aiResult ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Tire uma foto que prove que fez a atividade. A foto NÃO deve conter rostos.
              </Typography>
              {selectedActivity && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#E8EAF6' }}>
                  <Typography variant="body2" fontWeight={600}>{selectedActivity.title}</Typography>
                  <Typography variant="caption">{selectedActivity.pointsValue} pontos</Typography>
                </Paper>
              )}
              <Box sx={{ border: '2px dashed', borderColor: 'grey.300', borderRadius: 2, p: 3, textAlign: 'center', cursor: 'pointer', bgcolor: photoPreview ? 'transparent' : '#FAFAFA' }}
                onClick={() => document.getElementById('photo-input').click()}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
                ) : (
                  <>
                    <CameraIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">Toque para tirar/adicionar foto</Typography>
                  </>
                )}
              </Box>
              <input id="photo-input" type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhotoSelect} />
            </>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              {aiResult.status === 'approved' ? <CheckIcon sx={{ fontSize: 64, color: '#4CAF50', mb: 2 }} /> : aiResult.status === 'rejected' ? <CloseIcon sx={{ fontSize: 64, color: '#F44336', mb: 2 }} /> : <TimeIcon sx={{ fontSize: 64, color: '#FF9800', mb: 2 }} />}
              <Typography variant="h6" fontWeight={600}>{aiResult.status === 'approved' ? 'Foto Validada!' : aiResult.status === 'rejected' ? 'Foto Rejeitada' : 'Pendente Revisão'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setPhotoDialogOpen(false); setAiResult(null); setPhotoPreview(null); }}>{aiResult ? 'Fechar' : 'Cancelar'}</Button>
          {!aiResult && <Button variant="contained" onClick={handleUploadPhoto} disabled={!photoFile || uploading}>{uploading ? 'A enviar...' : 'Enviar Foto'}</Button>}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OutsidePage;
