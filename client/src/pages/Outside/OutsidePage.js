import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent,
  Chip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Paper, LinearProgress, TextField,
  Avatar, CircularProgress, IconButton
} from '@mui/material';
import {
  NaturePeople as OutsideIcon,
  CameraAlt as CameraIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Restaurant as MealIcon,
  Bedtime as SleepIcon,
  FamilyRestroom as FamilyIcon,
  Lightbulb as TipIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon,
  Save as SaveIcon,
  Visibility as ViewIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  HourglassEmpty as PendingIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import AppHeader from '../../components/layout/AppHeader';
import { activityAPI, aiAPI, photoAPI, parentAPI, dashboardAPI } from '../../services/api';

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
  const [aiLoading, setAiLoading] = useState(false);
  const [searchQuery] = useState('');

  // Parent state
  const [dashboardChildren, setDashboardChildren] = useState([]);
  const [childSettings, setChildSettings] = useState({});
  const [childSettingsLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [parentActivities, setParentActivities] = useState([]);
  const [parentPhotos, setParentPhotos] = useState([]);
  const [selectedChildForPhotos, setSelectedChildForPhotos] = useState(null);
  const [photoViewDialogOpen, setPhotoViewDialogOpen] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [validatingPhoto, setValidatingPhoto] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setActivities([]);
    setSuggestions([]);
    try {
      if (user?.role === 'parent') {
        if (tab === 0) {
          // Load dashboard stats to get children
          const statsRes = await dashboardAPI.getStats();
          const children = statsRes.data?.data?.children || [];
          setDashboardChildren(children);
          // Load settings for each child
          const settingsMap = {};
          for (const child of children) {
            try {
              const settingsRes = await parentAPI.getChildSettings(child.id);
              settingsMap[child.id] = settingsRes.data?.data || {};
            } catch (e) {
              settingsMap[child.id] = {
                maxScreenTimeHours: child.maxScreenTimeHours || 4,
                sleepTime: child.sleepTime || '22:00',
                mealTimes: child.mealTimes || [],
                familyTimeHours: child.familyTimeHours || 2,
                totalPoints: child.totalPoints || 0,
                currentStreak: child.currentStreak || 0,
                completedActivitiesThisWeek: 0
              };
            }
          }
          setChildSettings(settingsMap);
        } else if (tab === 1) {
          // Load child activities and photos
          if (dashboardChildren.length > 0) {
            const childId = dashboardChildren[0].id;
            setSelectedChildForPhotos(childId);
            const [actRes, photoRes] = await Promise.allSettled([
              activityAPI.getAll({ section: 'fora_escola' }),
              parentAPI.getChildPhotos(childId)
            ]);
            if (actRes.status === 'fulfilled') setParentActivities(actRes.value.data?.data || []);
            if (photoRes.status === 'fulfilled') setParentPhotos(photoRes.value.data?.data || []);
          }
        }
      } else {
        // Student
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
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [tab, user, dashboardChildren]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load parent children on mount
  useEffect(() => {
    if (user?.role === 'parent') {
      dashboardAPI.getStats().then(res => {
        const children = res.data?.data?.children || [];
        setDashboardChildren(children);
      }).catch(() => {});
    }
  }, [user?.role]);

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
    setAiLoading(true);
    setAiResult(null);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(photoFile);
      });

      // Step 1: Upload photo
      const uploadRes = await photoAPI.upload({ photo: base64, activityId: selectedActivity?._id, originalName: photoFile.name });

      if (uploadRes.data.success) {
        const photoId = uploadRes.data.data.id;

        // Step 2: Analyze photo with AI
        try {
          const analyzeRes = await aiAPI.analyzePhoto(photoId);
          const analysis = analyzeRes.data?.data?.analysis;
          setAiResult(analysis);
          enqueueSnackbar(analyzeRes.data?.message || 'Análise concluída!', { variant: analysis?.status === 'approved' ? 'success' : analysis?.status === 'rejected' ? 'error' : 'warning' });
        } catch (aiErr) {
          setAiResult({ status: 'pending_review', description: 'Erro na análise. A foto será revisada manualmente.' });
          enqueueSnackbar('Erro na análise IA. A foto será revisada.', { variant: 'warning' });
        }
      }
    } catch (e) {
      enqueueSnackbar('Erro ao enviar foto', { variant: 'error' });
    } finally {
      setUploading(false);
      setAiLoading(false);
    }
  };

  const handleChildSettingsChange = (childId, field, value) => {
    setChildSettings(prev => ({
      ...prev,
      [childId]: { ...prev[childId], [field]: value }
    }));
  };

  const handleSaveChildSettings = async (childId) => {
    const settings = childSettings[childId];
    if (!settings) return;
    setSavingSettings(true);
    try {
      await parentAPI.updateChildSettings(childId, {
        maxScreenTimeHours: settings.maxScreenTimeHours,
        sleepTime: settings.sleepTime,
        mealTimes: settings.mealTimes,
        familyTimeHours: settings.familyTimeHours
      });
      enqueueSnackbar('Definições guardadas com sucesso!', { variant: 'success' });
    } catch (e) {
      enqueueSnackbar('Erro ao guardar definições', { variant: 'error' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleValidatePhoto = async (photoId, approved) => {
    setValidatingPhoto(true);
    try {
      await parentAPI.validatePhoto(photoId, { approved });
      enqueueSnackbar(approved ? 'Foto aprovada!' : 'Foto rejeitada.', { variant: approved ? 'success' : 'warning' });
      // Refresh photos and activities
      setParentPhotos(prev => prev.map(p => p._id === photoId ? { ...p, status: approved ? 'approved' : 'rejected' } : p));
      setPhotoViewDialogOpen(false);
      setViewingPhoto(null);
      loadData();
    } catch (e) {
      enqueueSnackbar('Erro ao validar foto', { variant: 'error' });
    } finally {
      setValidatingPhoto(false);
    }
  };

  const closePhotoDialog = () => {
    setPhotoDialogOpen(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    setAiResult(null);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'approved': return <Chip label="Aprovada" color="success" size="small" icon={<CheckIcon />} />;
      case 'rejected': return <Chip label="Rejeitada" color="error" size="small" icon={<CloseIcon />} />;
      case 'pending_review': return <Chip label="Pendente" color="warning" size="small" icon={<PendingIcon />} />;
      default: return <Chip label="Pendente" color="default" size="small" icon={<PendingIcon />} />;
    }
  };

  /* ==================== STUDENT VIEW ==================== */
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
              <TipIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
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

  /* ==================== PARENT VIEW ==================== */
  const ParentView = () => {
    if (dashboardChildren.length === 0) {
      return (
        <Card sx={{ mb: 2, bgcolor: '#E8F5E9' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
            <FamilyIcon sx={{ fontSize: 32, color: '#4CAF50' }} />
            <Box>
              <Typography fontWeight={600}>Painel dos Pais</Typography>
              <Typography variant="body2" color="#388E3C">Acompanhe e defina as atividades dos seus filhos</Typography>
            </Box>
          </CardContent>
          <Paper sx={{ p: 4, textAlign: 'center', mx: 2, mb: 2 }}>
            <FamilyIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
            <Typography color="text.secondary">Nenhum filho vinculado. Use o código do filho para ligar a conta.</Typography>
          </Paper>
        </Card>
      );
    }

    return (
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

        {/* Tab 0: Definições */}
        {tab === 0 && (
          <>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Definições dos Filhos</Typography>
            {childSettingsLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }} color="text.secondary">A carregar definições...</Typography>
              </Box>
            ) : dashboardChildren.map(child => {
              const settings = childSettings[child.id] || {};
              return (
                <Card key={child.id} sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>{child.fullName?.charAt(0)}</Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={700}>{child.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary">{child.grade}º ano</Typography>
                      </Box>
                      <Chip label={`${settings.totalPoints || child.totalPoints || 0} pts`} color="primary" size="small" />
                    </Box>

                    {/* Dica do dia */}
                    <Card sx={{ mb: 2, bgcolor: '#E8F5E9' }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
                        <TipIcon sx={{ fontSize: 28, color: '#4CAF50' }} />
                        <Box>
                          <Typography fontWeight={600} color="#2E7D32" variant="body2">Dica do dia</Typography>
                          <Typography variant="caption" color="#388E3C">Limite o tempo de ecrã para promover atividades ao ar livre!</Typography>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Tempo de Ecrã */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TimeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography fontWeight={600} variant="body2">Tempo de Ecrã</Typography>
                        <Box sx={{ flex: 1 }} />
                        <Typography variant="body2" color="primary.main" fontWeight={700}>{settings.maxScreenTimeHours || 4}h</Typography>
                      </Box>
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={settings.maxScreenTimeHours || 4}
                        onChange={(e) => handleChildSettingsChange(child.id, 'maxScreenTimeHours', Math.max(1, Math.min(8, Number(e.target.value) || 1)))}
                        inputProps={{ min: 1, max: 8 }}
                        variant="outlined"
                        helperText="Limite diário (1-8 horas)"
                      />
                    </Box>

                    {/* Hora de Dormir */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <SleepIcon sx={{ color: '#9C27B0', fontSize: 20 }} />
                        <Typography fontWeight={600} variant="body2">Hora de Dormir</Typography>
                      </Box>
                      <TextField
                        type="time"
                        size="small"
                        fullWidth
                        value={settings.sleepTime || '22:00'}
                        onChange={(e) => handleChildSettingsChange(child.id, 'sleepTime', e.target.value)}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>

                    {/* Horário de Refeições */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <MealIcon sx={{ color: '#FF9800', fontSize: 20 }} />
                        <Typography fontWeight={600} variant="body2">Horário de Refeições</Typography>
                      </Box>
                      <Paper sx={{ p: 2, bgcolor: '#FFF8E1' }}>
                        {(settings.mealTimes && settings.mealTimes.length > 0) ? (
                          settings.mealTimes.map((mt, i) => (
                            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2" fontWeight={600}>{mt.type || 'Refeição'}</Typography>
                              <Typography variant="body2" color="text.secondary">{mt.time || '--:--'}</Typography>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">Definido pelos pais</Typography>
                        )}
                      </Paper>
                    </Box>

                    {/* Tempo em Família */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <FamilyIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                        <Typography fontWeight={600} variant="body2">Tempo em Família</Typography>
                        <Box sx={{ flex: 1 }} />
                        <Typography variant="body2" color="#4CAF50" fontWeight={700}>{settings.familyTimeHours || 2}h</Typography>
                      </Box>
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={settings.familyTimeHours || 2}
                        onChange={(e) => handleChildSettingsChange(child.id, 'familyTimeHours', Math.max(1, Math.min(6, Number(e.target.value) || 1)))}
                        inputProps={{ min: 1, max: 6 }}
                        variant="outlined"
                        helperText="Horas diárias recomendadas (1-6)"
                      />
                    </Box>

                    {/* Estatísticas Semanais */}
                    <Card sx={{ mb: 2, bgcolor: '#FFF8E1' }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <TrendingIcon sx={{ color: '#FF9800', fontSize: 20 }} />
                          <Typography fontWeight={600} variant="body2">Estatísticas Semanais</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {settings.completedActivitiesThisWeek || 0} atividades esta semana • {settings.totalPoints || 0} pontos
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Streak: {settings.currentStreak || child.currentStreak || 0} dia(s)
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* Save Button */}
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={savingSettings ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                      onClick={() => handleSaveChildSettings(child.id)}
                      disabled={savingSettings}
                    >
                      {savingSettings ? 'A guardar...' : 'Guardar Definições'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}

        {/* Tab 1: Atividades */}
        {tab === 1 && (
          <>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Atividades dos Filhos</Typography>

            {/* Child selector if multiple children */}
            {dashboardChildren.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto', pb: 1 }}>
                {dashboardChildren.map(child => (
                  <Chip
                    key={child.id}
                    label={child.fullName?.split(' ')[0]}
                    onClick={async () => {
                      setSelectedChildForPhotos(child.id);
                      try {
                        const [actRes, photoRes] = await Promise.allSettled([
                          activityAPI.getAll({ section: 'fora_escola' }),
                          parentAPI.getChildPhotos(child.id)
                        ]);
                        if (actRes.status === 'fulfilled') setParentActivities(actRes.value.data?.data || []);
                        if (photoRes.status === 'fulfilled') setParentPhotos(photoRes.value.data?.data || []);
                      } catch (e) { console.error(e); }
                    }}
                    color={selectedChildForPhotos === child.id ? 'primary' : 'default'}
                    variant={selectedChildForPhotos === child.id ? 'filled' : 'outlined'}
                    sx={{ whiteSpace: 'nowrap' }}
                  />
                ))}
              </Box>
            )}

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : parentActivities.length === 0 && parentPhotos.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <StarIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
                <Typography color="text.secondary">Sem atividades ou fotos para mostrar.</Typography>
              </Paper>
            ) : (
              <>
                {/* Activities with photos */}
                {parentActivities.map(activity => {
                  const activityPhotos = parentPhotos.filter(p => {
                    const actId = p.activity?.$oid || p.activity?.toString() || '';
                    return actId === activity._id?.toString();
                  });
                  if (activityPhotos.length === 0) return null;
                  return (
                    <Card key={activity._id} sx={{ mb: 2 }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography fontWeight={600}>{activity.title}</Typography>
                        {activity.description && <Typography variant="body2" color="text.secondary">{activity.description}</Typography>}
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                          <Chip size="small" label={activity.category} variant="outlined" />
                          <Chip size="small" label={`${activity.pointsValue} pts`} color="primary" />
                        </Box>
                        {/* Photo thumbnails */}
                        <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                          {activityPhotos.map(photo => (
                            <Box
                              key={photo._id}
                              onClick={() => { setViewingPhoto(photo); setPhotoViewDialogOpen(true); }}
                              sx={{
                                position: 'relative', width: 80, height: 80, borderRadius: 1,
                                overflow: 'hidden', cursor: 'pointer', border: '2px solid',
                                borderColor: photo.status === 'approved' ? '#4CAF50' : photo.status === 'rejected' ? '#F44336' : '#FF9800'
                              }}
                            >
                              <img src={photo.filePath} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <Box sx={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                bgcolor: 'rgba(0,0,0,0.6)', px: 0.5
                              }}>
                                <Typography variant="caption" sx={{ color: 'white', fontSize: '0.6rem' }}>
                                  {photo.status === 'approved' ? '✓' : photo.status === 'rejected' ? '✗' : '⏳'}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Photos without activity */}
                {parentPhotos.filter(p => !p.activity).map(photo => (
                  <Card key={photo._id} sx={{ mb: 2 }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        onClick={() => { setViewingPhoto(photo); setPhotoViewDialogOpen(true); }}
                        sx={{ width: 60, height: 60, borderRadius: 1, overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}
                      >
                        <img src={photo.filePath} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>Foto sem atividade</Typography>
                        <Box sx={{ mt: 0.5 }}>{getStatusChip(photo.status)}</Box>
                        {photo.aiAnalysis?.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {photo.aiAnalysis.description}
                          </Typography>
                        )}
                      </Box>
                      <IconButton onClick={() => { setViewingPhoto(photo); setPhotoViewDialogOpen(true); }}>
                        <ViewIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      <AppHeader title="Fora da Escola" showBack showProfile={false} />

      <Box sx={{
        bgcolor: 'background.paper', borderBottom: '2px solid',
        borderColor: 'divider', position: 'sticky', top: 56, zIndex: 10,
        display: 'flex'
      }}>
        {(user?.role === 'parent'
          ? [
              { label: 'Definições', icon: <OutsideIcon sx={{ fontSize: 18 }} /> },
              { label: 'Atividades', icon: <StarIcon sx={{ fontSize: 18 }} /> }
            ]
          : [
              { label: 'Atividades', icon: <CheckIcon sx={{ fontSize: 18 }} /> },
              { label: 'Sugestões', icon: <TipIcon sx={{ fontSize: 18 }} /> },
              { label: 'Tempo', icon: <TimeIcon sx={{ fontSize: 18 }} /> }
            ]
        ).map((t, i) => (
          <Box
            key={i}
            onClick={() => setTab(i)}
            sx={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 0.5, py: 1.5, px: 1, cursor: 'pointer', userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              borderBottom: tab === i ? '3px solid' : '3px solid transparent',
              borderColor: tab === i ? 'primary.main' : 'transparent',
              color: tab === i ? 'primary.main' : 'text.secondary',
              bgcolor: tab === i ? 'rgba(255, 152, 0, 0.06)' : 'transparent',
              fontWeight: tab === i ? 700 : 400, fontSize: '0.8rem',
              transition: 'all 0.2s ease',
              '&:active': { bgcolor: 'rgba(255, 152, 0, 0.12)' }
            }}
          >
            {t.icon}
            <Typography variant="caption" sx={{ fontWeight: 'inherit', fontSize: '0.75rem' }}>{t.label}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ px: 2, pt: 2 }}>
        {user?.role === 'parent' ? <ParentView /> : <StudentView />}
      </Box>

      {/* Photo Upload Dialog */}
      <Dialog open={photoDialogOpen} onClose={closePhotoDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {aiLoading ? 'A analisar foto...' : aiResult ? 'Resultado da Análise' : 'Provar Atividade com Foto'}
        </DialogTitle>
        <DialogContent>
          {!aiResult && !aiLoading ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Tire uma foto que prove que fez a atividade. A foto NÃO deve conter rostos.
              </Typography>
              {selectedActivity && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#FFF3E0' }}>
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
          ) : aiLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="body1" fontWeight={600}>A IA está a analisar a foto...</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Isto pode demorar alguns segundos</Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              {aiResult.status === 'approved' ? (
                <CheckIcon sx={{ fontSize: 64, color: '#4CAF50', mb: 2 }} />
              ) : aiResult.status === 'rejected' ? (
                <CloseIcon sx={{ fontSize: 64, color: '#F44336', mb: 2 }} />
              ) : (
                <PendingIcon sx={{ fontSize: 64, color: '#FF9800', mb: 2 }} />
              )}
              <Typography variant="h6" fontWeight={600}>
                {aiResult.status === 'approved' ? 'Foto Aprovada! 🎉' : aiResult.status === 'rejected' ? 'Foto Rejeitada' : 'Pendente Revisão'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {aiResult.description || ''}
              </Typography>
              {aiResult.status === 'approved' && selectedActivity && (
                <Typography variant="body2" color="primary.main" sx={{ mt: 1 }}>
                  Atividade concluída automaticamente! +{selectedActivity.pointsValue} pontos
                </Typography>
              )}
              {aiResult.status === 'pending_review' && (
                <Typography variant="body2" color="#FF9800" sx={{ mt: 1 }}>
                  Enviada para validação do pai
                </Typography>
              )}
              {aiResult.flaggedIssues?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  {aiResult.flaggedIssues.map((issue, i) => (
                    <Chip key={i} label={issue} size="small" color="error" variant="outlined" sx={{ m: 0.5 }} />
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePhotoDialog}>
            {aiResult ? 'Fechar' : 'Cancelar'}
          </Button>
          {!aiResult && !aiLoading && (
            <Button variant="contained" onClick={handleUploadPhoto} disabled={!photoFile || uploading}>
              {uploading ? 'A enviar...' : 'Enviar Foto'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Parent Photo View Dialog */}
      <Dialog open={photoViewDialogOpen} onClose={() => { setPhotoViewDialogOpen(false); setViewingPhoto(null); }} fullWidth maxWidth="sm">
        <DialogTitle>Validar Foto</DialogTitle>
        <DialogContent>
          {viewingPhoto && (
            <>
              <img src={viewingPhoto.filePath} alt="Foto" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 8, mb: 16 }} />
              <Box sx={{ mb: 2 }}>
                {getStatusChip(viewingPhoto.status)}
              </Box>
              {viewingPhoto.aiAnalysis && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#F5F5F5' }}>
                  <Typography variant="body2" fontWeight={600}>Análise IA:</Typography>
                  <Typography variant="body2" color="text.secondary">{viewingPhoto.aiAnalysis.description || 'Sem descrição'}</Typography>
                  {viewingPhoto.aiAnalysis.confidence && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Typography variant="caption">Confiança:</Typography>
                      <LinearProgress variant="determinate" value={viewingPhoto.aiAnalysis.confidence} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                      <Typography variant="caption">{viewingPhoto.aiAnalysis.confidence}%</Typography>
                    </Box>
                  )}
                  {viewingPhoto.aiAnalysis.flaggedIssues?.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {viewingPhoto.aiAnalysis.flaggedIssues.map((issue, i) => (
                        <Typography key={i} variant="caption" color="error">⚠️ {issue}</Typography>
                      ))}
                    </Box>
                  )}
                </Paper>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setPhotoViewDialogOpen(false); setViewingPhoto(null); }}>Fechar</Button>
          {viewingPhoto?.status === 'pending_review' && (
            <>
              <Button
                startIcon={validatingPhoto ? <CircularProgress size={16} /> : <ThumbDownIcon />}
                onClick={() => handleValidatePhoto(viewingPhoto._id, false)}
                color="error"
                disabled={validatingPhoto}
              >
                Rejeitar
              </Button>
              <Button
                startIcon={validatingPhoto ? <CircularProgress size={16} /> : <ThumbUpIcon />}
                onClick={() => handleValidatePhoto(viewingPhoto._id, true)}
                color="success"
                variant="contained"
                disabled={validatingPhoto}
              >
                Aprovar
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OutsidePage;
