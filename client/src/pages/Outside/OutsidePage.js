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
  Star as StarIcon
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
  const [loading, setLoading] = useState(true);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        const res = await activityAPI.getAll({ section: 'fora_escola' });
        setActivities(res.data.data);
      } else if (tab === 1) {
        if (user?.activityPreferences?.length > 0) {
          try {
            const res = await aiAPI.getSuggestions({ preferences: user.activityPreferences });
            setSuggestions(res.data.data?.suggestions || []);
          } catch (e) {
            setSuggestions([
              { title: 'Passeio', description: 'Faça um passeio de 30 minutos', estimatedMinutes: 30, pointsValue: 15, requiresPhoto: true },
              { title: 'Leitura', description: 'Leia por 20 minutos', estimatedMinutes: 20, pointsValue: 10, requiresPhoto: true },
              { title: 'Desenho', description: 'Desenhe algo à sua volta', estimatedMinutes: 25, pointsValue: 12, requiresPhoto: true }
            ]);
          }
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
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(photoFile);
      });

      const uploadRes = await photoAPI.upload({
        photo: base64,
        activityId: selectedActivity?._id,
        originalName: photoFile.name
      });

      if (uploadRes.data.success) {
        // Analyze with AI
        try {
          const aiRes = await aiAPI.analyzePhoto(uploadRes.data.data.id);
          setAiResult(aiRes.data.data);

          if (aiRes.data.data.status === 'approved') {
            enqueueSnackbar('Foto validada! Ganhou pontos!', { variant: 'success' });
          } else if (aiRes.data.data.status === 'manual_review') {
            enqueueSnackbar('Foto contém rosto. Pendente revisão.', { variant: 'warning' });
          } else {
            enqueueSnackbar('Foto rejeitada: ' + (aiRes.data.data.rejectionReason || ''), { variant: 'error' });
          }
        } catch (e) {
          enqueueSnackbar('Foto enviada! Análise pendente.', { variant: 'info' });
        }

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
      {/* Tips Card */}
      <Card sx={{ mb: 2, bgcolor: '#E8F5E9' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
          <TipIcon sx={{ fontSize: 32, color: '#4CAF50' }} />
          <Box>
            <Typography fontWeight={600} color="#2E7D32">Dica do dia</Typography>
            <Typography variant="body2" color="#388E3C">
              Tente passar pelo menos 1 hora sem olhar para ecrãs hoje!
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Tab 0: Activities */}
      {tab === 0 && (
        <>
          <TextField
            fullWidth
            size="small"
            placeholder="Pesquisar atividades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
            }}
          />

          {/* Create new activity */}
          <Card sx={{ mb: 2, cursor: 'pointer', border: '2px dashed', borderColor: 'primary.light' }} onClick={() => {
            const newAct = {
              title: 'Atividade Livre',
              description: 'Prove que fez uma atividade offline',
              category: 'social',
              section: 'fora_escola',
              pointsValue: 10,
              requiresPhoto: true
            };
            setSelectedActivity(newAct);
            setPhotoDialogOpen(true);
          }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <CameraIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2" color="primary.main" fontWeight={600}>
                Registrar atividade com foto
              </Typography>
            </CardContent>
          </Card>

          {activities
            .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(activity => (
              <Card key={activity._id} sx={{ mb: 1.5 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={600}>{activity.title}</Typography>
                      {activity.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {activity.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                        <Chip size="small" label={activity.category} variant="outlined" />
                        <Chip size="small" label={`${activity.pointsValue} pts`} color="primary" />
                        {activity.isMission && <Chip size="small" label="Missão" color="warning" />}
                      </Box>
                    </Box>
                  </Box>

                  {activity.status === 'pendente' && (
                    <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckIcon />}
                        onClick={() => {
                          activityAPI.complete(activity._id).then(() => loadData()).catch(console.error);
                        }}
                      >
                        Concluir
                      </Button>
                      {activity.requiresPhoto && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<CameraIcon />}
                          onClick={() => {
                            setSelectedActivity(activity);
                            setPhotoDialogOpen(true);
                          }}
                        >
                          Provar
                        </Button>
                      )}
                    </Box>
                  )}

                  {activity.status === 'concluida' && (
                    <Chip label="Concluída" color="info" size="small" sx={{ mt: 1 }} />
                  )}

                  {activity.status === 'validada' && (
                    <Chip label="Validada" color="success" size="small" sx={{ mt: 1 }} />
                  )}
                </CardContent>
              </Card>
            ))}
        </>
      )}

      {/* Tab 1: AI Suggestions */}
      {tab === 1 && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Sugestões Personalizadas ✨
          </Typography>
          {suggestions.map((sug, i) => (
            <Card key={i} sx={{ mb: 1.5 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography fontWeight={600}>{sug.title}</Typography>
                <Typography variant="body2" color="text.secondary">{sug.description}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Chip size="small" label={`${sug.estimatedMinutes || 30} min`} variant="outlined" />
                    <Chip size="small" label={`${sug.pointsValue || 10} pts`} color="primary" />
                  </Box>
                  {sug.requiresPhoto && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<CameraIcon />}
                      onClick={() => {
                        setSelectedActivity({
                          title: sug.title,
                          description: sug.description,
                          category: sug.category,
                          pointsValue: sug.pointsValue,
                          requiresPhoto: true
                        });
                        setPhotoDialogOpen(true);
                      }}
                    >
                      Provar
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </>
      )}

      {/* Tab 2: Calendar/Time Management */}
      {tab === 2 && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Gestão de Tempo</Typography>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TimeIcon sx={{ color: 'primary.main' }} />
                <Box>
                  <Typography fontWeight={600}>Tempo de Ecrã</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Limite diário: {user?.maxScreenTimeHours || 4}h
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={30}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                ~1h 30min utilizadas hoje
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <SleepIcon sx={{ color: '#9C27B0' }} />
                <Box>
                  <Typography fontWeight={600}>Hora de Dormir</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.sleepTime || '22:00'}
                  </Typography>
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
                  <Typography variant="body2" color="text.secondary">
                    Definido pela escola e família
                  </Typography>
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
                  <Typography variant="body2" color="text.secondary">
                    Definido pelos pais
                  </Typography>
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
            <Typography variant="body2" color="#388E3C">
              Acompanhe e defina as atividades dos seus filhos
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {tab === 0 && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Definições dos Filhos</Typography>

          {/* Screen Time */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Tempo de Ecrã
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Defina o tempo máximo diário de ecrã para cada filho.
              </Typography>
              <Button variant="outlined" size="small">Configurar</Button>
            </CardContent>
          </Card>

          {/* Sleep Time */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Hora de Dormir
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Defina a hora de dormir para crianças (10-14 anos).
              </Typography>
              <TextField type="time" size="small" defaultValue="22:00" InputLabelProps={{ shrink: true }} />
            </CardContent>
          </Card>

          {/* Meal Times */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Refeições
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Defina os horários das refeições fora da escola.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                {['Almoço', 'Lanche', 'Jantar'].map(meal => (
                  <Box key={meal} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>{meal}</Typography>
                    <TextField type="time" size="small" InputLabelProps={{ shrink: true }} sx={{ width: 120 }} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Family Time */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Tempo em Família
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Defina períodos de tempo em família. Serão adicionados ao calendário dos filhos.
              </Typography>
              <Button variant="contained" size="small" startIcon={<AddIcon />}>
                Adicionar Tempo
              </Button>
            </CardContent>
          </Card>

          {/* Domestic Activities */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Atividades Domésticas
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Sugira tarefas domésticas para os filhos completarem.
              </Typography>
              <Button variant="outlined" size="small" startIcon={<AddIcon />}>
                Adicionar Tarefa
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {tab === 1 && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Atividades dos Filhos</Typography>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <StarIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
            <Typography color="text.secondary">
              As atividades completadas pelos filhos aparecerão aqui.
            </Typography>
          </Paper>
        </>
      )}
    </>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      <AppHeader title="Fora da Escola" showBack showProfile={false} />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}
      >
        {user?.role === 'parent' ? (
          <>
            <Tab label="Definições" icon={<OutsideIcon />} iconPosition="start" sx={{ minHeight: 60 }} />
            <Tab label="Atividades" icon={<StarIcon />} iconPosition="start" sx={{ minHeight: 60 }} />
          </>
        ) : (
          <>
            <Tab label="Atividades" icon={<CheckIcon />} iconPosition="start" sx={{ minHeight: 60 }} />
            <Tab label="Sugestões" icon={<TipIcon />} iconPosition="start" sx={{ minHeight: 60 }} />
            <Tab label="Tempo" icon={<TimeIcon />} iconPosition="start" sx={{ minHeight: 60 }} />
          </>
        )}
      </Tabs>

      <Box sx={{ px: 2, pt: 2 }}>
        {loading ? (
          <Typography textAlign="center" sx={{ py: 4 }}>A carregar...</Typography>
        ) : user?.role === 'parent' ? (
          <ParentView />
        ) : (
          <StudentView />
        )}
      </Box>

      {/* Photo Upload Dialog */}
      <Dialog
        open={photoDialogOpen}
        onClose={() => { setPhotoDialogOpen(false); setAiResult(null); }}
        fullWidth
        maxWidth="sm"
        container={document.body}
        PaperProps={{
          sx: { position: 'relative' }
        }}
      >
        <DialogTitle>
          {aiResult ? 'Resultado da Análise' : 'Provar Atividade com Foto'}
        </DialogTitle>
        <DialogContent>
          {!aiResult ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Tire uma foto que prove que fez a atividade. A foto NÃO deve conter rostos (sem selfies).
              </Typography>
              {selectedActivity && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#E8EAF6' }}>
                  <Typography variant="body2" fontWeight={600}>{selectedActivity.title}</Typography>
                  <Typography variant="caption">{selectedActivity.pointsValue} pontos</Typography>
                </Paper>
              )}
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'grey.300',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: photoPreview ? 'transparent' : '#FAFAFA'
                }}
                onClick={() => document.getElementById('photo-input').click()}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
                ) : (
                  <>
                    <CameraIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">Toque para tirar/adicionar foto</Typography>
                  </>
                )}
              </Box>
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handlePhotoSelect}
              />
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                Atenção: Fotos com rostos serão recusadas ou enviadas para revisão manual.
              </Typography>
            </>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              {aiResult.status === 'approved' ? (
                <CheckIcon sx={{ fontSize: 64, color: '#4CAF50', mb: 2 }} />
              ) : aiResult.status === 'rejected' ? (
                <CloseIcon sx={{ fontSize: 64, color: '#F44336', mb: 2 }} />
              ) : (
                <TimeIcon sx={{ fontSize: 64, color: '#FF9800', mb: 2 }} />
              )}
              <Typography variant="h6" fontWeight={600}>
                {aiResult.status === 'approved' ? 'Foto Validada!' :
                 aiResult.status === 'rejected' ? 'Foto Rejeitada' : 'Pendente Revisão'}
              </Typography>
              {aiResult.analysis && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {aiResult.analysis.description}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {aiResult.analysis.feedback}
                  </Typography>
                  {aiResult.analysis.hasFace && (
                    <Chip label="Rosto detetado" color="warning" sx={{ mt: 1 }} />
                  )}
                  {aiResult.pointsAwarded > 0 && (
                    <Chip label={`${aiResult.pointsAwarded} pontos ganhos!`} color="success" sx={{ mt: 1, ml: 1 }} />
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setPhotoDialogOpen(false); setAiResult(null); setPhotoPreview(null); }}>
            {aiResult ? 'Fechar' : 'Cancelar'}
          </Button>
          {!aiResult && (
            <Button
              variant="contained"
              onClick={handleUploadPhoto}
              disabled={!photoFile || uploading}
            >
              {uploading ? 'A enviar...' : 'Enviar Foto'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OutsidePage;
