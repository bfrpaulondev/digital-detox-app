import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Card, CardContent, List, ListItem,
  ListItemText, Chip, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Avatar,
  IconButton, Fab, Paper, InputAdornment, MenuItem,
  CircularProgress } from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Star as StarIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Apartment as SchoolIcon,
  LocationOn as LocationIcon,
  HowToVote as VoteIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Event as EventIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import AppHeader from '../../components/layout/AppHeader';
import { activityAPI, userAPI, schoolAPI, calendarAPI } from '../../services/api';

const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const MISSION_CATEGORIES = [
  { value: 'escola', label: 'Ambiente Escolar' },
  { value: 'social', label: 'Ajudar Colegas' },
  { value: 'desporto', label: 'Desporto' },
  { value: 'natureza', label: 'Natureza' },
  { value: 'arte', label: 'Arte' },
  { value: 'leitura', label: 'Leitura' },
  { value: 'jogos_ar_livre', label: 'Jogos ao Ar Livre' },
  { value: 'tecnologia_criativa', label: 'Tech Criativa (sem ecrãs)' },
  { value: 'domestica', label: 'Organização' }
];

function CustomTabBar({ tabs, activeTab, onTabChange }) {
  return (
    <Box sx={{
      bgcolor: 'background.paper', borderBottom: '2px solid',
      borderColor: 'divider', position: 'sticky', top: 56, zIndex: 10, display: 'flex'
    }}>
      {tabs.map((tab, index) => {
        const isActive = activeTab === index;
        return (
          <Box key={index} onClick={() => onTabChange(index)} sx={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 0.5, py: 1.5, px: 0.5, cursor: 'pointer', userSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
            borderBottom: isActive ? '3px solid' : '3px solid transparent',
            borderColor: isActive ? 'primary.main' : 'transparent',
            color: isActive ? 'primary.main' : 'text.secondary',
            bgcolor: isActive ? 'rgba(255, 152, 0, 0.06)' : 'transparent',
            fontWeight: isActive ? 700 : 400, fontSize: '0.75rem',
            transition: 'all 0.2s ease', '&:active': { bgcolor: 'rgba(255, 152, 0, 0.12)' }
          }}>
            {tab.icon}
            <Typography variant="caption" sx={{ fontWeight: 'inherit', fontSize: '0.7rem' }}>{tab.label}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════
// CALENDAR VIEW (Teacher - create missions)
// ═══════════════════════════════════════════════════════════════
const TeacherCalendar = ({ enqueueSnackbar }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [missionDialogOpen, setMissionDialogOpen] = useState(false);
  const [newMission, setNewMission] = useState({
    title: '', description: '', category: 'escola', classGroup: '',
    pointsValue: 15, requiresPhoto: true, scheduledTime: ''
  });

  const loadMissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await calendarAPI.getEvents({ month: currentMonth, year: currentYear });
      setMissions(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => { loadMissions(); }, [loadMissions]);

  const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month - 1, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const handleNextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const handleDateClick = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setMissionDialogOpen(true);
  };

  const handleCreateMission = async () => {
    if (!newMission.title || !selectedDate) return;
    try {
      await calendarAPI.createMission({
        ...newMission,
        scheduledDate: selectedDate
      });
      setMissionDialogOpen(false);
      setSelectedDate(null);
      setNewMission({ title: '', description: '', category: 'escola', classGroup: '', pointsValue: 15, requiresPhoto: true, scheduledTime: '' });
      enqueueSnackbar('Missão criada com sucesso!', { variant: 'success' });
      loadMissions();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.message || 'Erro ao criar missão', { variant: 'error' });
    }
  };

  const getMissionsForDate = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return missions.filter(m => {
      if (!m.date) return false;
      const d = new Date(m.date);
      return d.getFullYear() === currentYear && (d.getMonth() + 1) === currentMonth && d.getDate() === day;
    });
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  return (
    <Box>
      {/* Month Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <IconButton onClick={handlePrevMonth}><ChevronLeftIcon /></IconButton>
        <Typography variant="h6" fontWeight={700}>{MONTHS_PT[currentMonth - 1]} {currentYear}</Typography>
        <IconButton onClick={handleNextMonth}><ChevronRightIcon /></IconButton>
      </Box>

      {/* Day Headers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
        {DAYS_PT.map(d => (
          <Typography key={d} variant="caption" fontWeight={700} color="text.secondary" textAlign="center">{d}</Typography>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <Paper key={`empty-${i}`} sx={{ p: 1, minHeight: 48, bgcolor: 'grey.50' }} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = day === today.getDate() && currentMonth === (today.getMonth() + 1) && currentYear === today.getFullYear();
          const dayMissions = getMissionsForDate(day);
          const hasMissions = dayMissions.length > 0;

          return (
            <Paper
              key={day}
              onClick={() => handleDateClick(day)}
              sx={{
                p: 0.5, minHeight: 52, cursor: 'pointer', position: 'relative',
                bgcolor: isToday ? '#FFF3E0' : hasMissions ? '#FFF8E1' : 'white',
                border: isToday ? '2px solid #FF9800' : '1px solid',
                borderColor: isToday ? '#FF9800' : 'divider',
                borderRadius: 1.5, transition: 'all 0.15s ease',
                '&:hover': { bgcolor: isToday ? '#FFE0B2' : '#F5F5F5', transform: 'scale(1.02)' }
              }}
            >
              <Typography variant="caption" fontWeight={isToday ? 800 : 500} color={isToday ? 'primary.main' : 'text.secondary'}>
                {day}
              </Typography>
              {hasMissions && (
                <Box sx={{ display: 'flex', gap: 0.3, mt: 0.3, flexWrap: 'wrap' }}>
                  {dayMissions.slice(0, 2).map((m, idx) => (
                    <Chip
                      key={idx}
                      size="small"
                      label={m.isMission ? '🎯' : '📋'}
                      sx={{ height: 16, fontSize: '0.6rem', minWidth: 16 }}
                    />
                  ))}
                  {dayMissions.length > 2 && (
                    <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>+{dayMissions.length - 2}</Typography>
                  )}
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>

      {/* Missions List for Current Month */}
      <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 1 }}>
        Missões de {MONTHS_PT[currentMonth - 1]}
      </Typography>
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 3 }}><CircularProgress size={24} /></Box>
      ) : missions.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <EventIcon sx={{ fontSize: 40, color: 'grey.300', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Clica num dia do calendário para adicionar uma missão!
          </Typography>
        </Paper>
      ) : (
        missions.sort((a, b) => new Date(a.date) - new Date(b.date)).map(mission => (
          <Card key={mission.id} sx={{ mb: 1.5 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    {mission.isMission && <span style={{ fontSize: 14 }}>🎯</span>}
                    <Typography fontWeight={600} variant="body2">{mission.title}</Typography>
                  </Box>
                  {mission.description && (
                    <Typography variant="caption" color="text.secondary">{mission.description}</Typography>
                  )}
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                    📅 {mission.date ? new Date(mission.date).toLocaleDateString('pt-PT') : ''}
                    {mission.classGroup && ` • ${mission.classGroup}º ano`}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Chip size="small" label={`${mission.pointsValue || 15} pts`} color="primary" />
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                    {mission.completionCount || 0}/{mission.totalAssigned || 0}
                  </Typography>
                </Box>
              </Box>

              {/* Show completions for teacher */}
              {mission.completedBy?.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  {mission.completedBy.map((comp, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F5F5F5', p: 0.5, borderRadius: 1.5, mb: 0.5 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.light', fontSize: 11 }}>
                        {comp.user?.fullName?.charAt(0) || '?'}
                      </Avatar>
                      <Typography variant="caption" sx={{ flex: 1 }}>{comp.user?.fullName}</Typography>
                      {comp.validatedBy ? (
                        <Chip label="✓" size="small" color="success" sx={{ height: 20, minWidth: 20 }} />
                      ) : (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" color="success" onClick={() => activityAPI.validate(mission.id, { studentId: comp.user?._id || comp.user, approved: true }).then(() => loadMissions())}>
                            <CheckIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => activityAPI.validate(mission.id, { studentId: comp.user?._id || comp.user, approved: false }).then(() => loadMissions())}>
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {/* Create Mission Dialog */}
      <Dialog open={missionDialogOpen} onClose={() => setMissionDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ fontSize: 20 }}>🎯</span>
            Nova Missão Diária
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Data: <strong>{selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</strong>
          </Typography>
          <TextField fullWidth label="Título da Missão" placeholder="Ex: Recolher o lixo do recreio" value={newMission.title} onChange={(e) => setNewMission(p => ({ ...p, title: e.target.value }))} sx={{ mb: 1.5 }} />
          <TextField fullWidth label="Descrição" placeholder="Ex: Recolher todo o lixo encontrado no recreio durante o intervalo" value={newMission.description} onChange={(e) => setNewMission(p => ({ ...p, description: e.target.value }))} sx={{ mb: 1.5 }} multiline rows={2} />
          <TextField fullWidth select label="Categoria" value={newMission.category} onChange={(e) => setNewMission(p => ({ ...p, category: e.target.value }))} sx={{ mb: 1.5 }}>
            {MISSION_CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
          </TextField>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField fullWidth select label="Ano/Turma" value={newMission.classGroup} onChange={(e) => setNewMission(p => ({ ...p, classGroup: e.target.value }))}>
              <MenuItem value="">Todos os anos</MenuItem>
              {[5, 6, 7, 8, 9, 10, 11, 12].map(g => <MenuItem key={g} value={String(g)}>{g}º ano</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Pontos" type="number" value={newMission.pointsValue} onChange={(e) => setNewMission(p => ({ ...p, pointsValue: parseInt(e.target.value) || 15 }))} inputProps={{ min: 5, max: 50 }} />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            💡 Dica: Foque em atividades que melhorem o ambiente escolar e libertem os colegas do vício digital!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMissionDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateMission} disabled={!newMission.title}>
            Criar Missão 🎯
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════
// SCHOOLS MANAGEMENT (Teacher - CRUD with 3-vote system)
// ═══════════════════════════════════════════════════════════════
const SchoolsManagement = ({ enqueueSnackbar }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});
  const [newSchool, setNewSchool] = useState({ name: '', code: '', city: '', address: '' });
  const [editSchool, setEditSchool] = useState({ name: '', city: '', address: '' });

  const loadSchools = async () => {
    setLoading(true);
    try {
      const res = await schoolAPI.getAll();
      setSchools(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSchools(); }, []);

  const loadPendingChanges = async (schoolId) => {
    try {
      const res = await schoolAPI.getPendingChanges(schoolId);
      setPendingChanges(prev => ({ ...prev, [schoolId]: res.data?.data || null }));
    } catch (e) {
      console.error(e);
    }
  };

  // Load pending for all schools on mount
  useEffect(() => {
    schools.forEach(s => loadPendingChanges(s._id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schools]);

  const handleCreate = async () => {
    if (!newSchool.name || !newSchool.code || !newSchool.city) return;
    try {
      await schoolAPI.create(newSchool);
      setCreateDialogOpen(false);
      setNewSchool({ name: '', code: '', city: '', address: '' });
      enqueueSnackbar('Escola criada com sucesso!', { variant: 'success' });
      loadSchools();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.message || 'Erro ao criar escola', { variant: 'error' });
    }
  };

  const handleEdit = async () => {
    if (!selectedSchool) return;
    try {
      const res = await schoolAPI.update(selectedSchool._id, editSchool);
      enqueueSnackbar(res.data?.message || 'Proposta enviada!', { variant: res.data?.votesCount >= 3 ? 'success' : 'info' });
      setEditDialogOpen(false);
      loadSchools();
      loadPendingChanges(selectedSchool._id);
    } catch (e) {
      enqueueSnackbar(e.response?.data?.message || 'Erro', { variant: 'error' });
    }
  };

  const handleVoteDelete = async (school) => {
    try {
      const res = await schoolAPI.voteDelete(school._id);
      enqueueSnackbar(res.data?.message || 'Voto registado!', { variant: res.data?.votesCount >= 3 ? 'success' : 'info' });
      loadSchools();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.message || 'Erro', { variant: 'error' });
    }
  };

  const handleCancelPending = async (schoolId) => {
    try {
      await schoolAPI.cancelPending(schoolId);
      enqueueSnackbar('Proposta cancelada.', { variant: 'info' });
      loadPendingChanges(schoolId);
    } catch (e) {
      enqueueSnackbar(e.response?.data?.message || 'Erro', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Gestão de Escolas</Typography>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 3 }}><CircularProgress size={24} /></Box>
      ) : schools.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 40, color: 'grey.300', mb: 1 }} />
          <Typography color="text.secondary">Nenhuma escola registada</Typography>
        </Paper>
      ) : (
        schools.map(school => {
          const pending = pendingChanges[school._id];
          return (
            <Card key={school._id} sx={{ mb: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <SchoolIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700}>{school.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                      <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">{school.city}</Typography>
                      {school.address && <Typography variant="body2" color="text.secondary">• {school.address}</Typography>}
                    </Box>
                    <Typography variant="caption" color="text.secondary">Código: {school.code}</Typography>

                    {/* Pending Changes Banner */}
                    {pending?.type && (
                      <Paper sx={{ mt: 1.5, p: 1.5, bgcolor: pending.type === 'delete' ? '#FFEBEE' : '#FFF8E1', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <VoteIcon sx={{ fontSize: 18, color: pending.type === 'delete' ? 'error.main' : 'warning.main' }} />
                          <Typography variant="body2" fontWeight={600} color={pending.type === 'delete' ? 'error.main' : 'warning.main'}>
                            {pending.type === 'delete' ? 'Proposta de Eliminação' : 'Proposta de Alteração'}
                          </Typography>
                        </Box>
                        {pending.type === 'edit' && pending.proposedData && (
                          <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                            Alterações: {Object.entries(pending.proposedData).map(([k, v]) => `${k}: "${v}"`).join(', ')}
                          </Typography>
                        )}
                        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                          Votos: {pending.currentVotes || pending.votes?.length || 0}/3
                          {pending.votes?.map((v, i) => (
                            <span key={i}> • {v.teacherName}</span>
                          ))}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {pending.type === 'edit' && (
                            <Button size="small" variant="contained" color="warning" onClick={() => {
                              setSelectedSchool(school);
                              setEditSchool({
                                name: pending.proposedData?.name || school.name,
                                city: pending.proposedData?.city || school.city,
                                address: (pending.proposedData?.address ?? school.address) || ''
                              });
                              setEditDialogOpen(true);
                            }} startIcon={<VoteIcon />}>Votar</Button>
                          )}
                          {pending.type === 'delete' && (
                            <Button size="small" variant="contained" color="error" onClick={() => handleVoteDelete(school)} startIcon={<VoteIcon />}>Votar Eliminar</Button>
                          )}
                          <Button size="small" variant="outlined" onClick={() => handleCancelPending(school._id)} startIcon={<CancelIcon />}>Cancelar</Button>
                        </Box>
                      </Paper>
                    )}
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'flex-end' }}>
                  <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => {
                    setSelectedSchool(school);
                    setEditSchool({ name: school.name, city: school.city, address: school.address || '' });
                    setEditDialogOpen(true);
                  }}>Editar</Button>
                  <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => handleVoteDelete(school)}>Eliminar</Button>
                </Box>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Create School FAB */}
      <Fab color="primary" onClick={() => setCreateDialogOpen(true)} sx={{ position: 'fixed', bottom: 86, right: 16 }}>
        <AddIcon />
      </Fab>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle><SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Nova Escola</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nome da Escola" value={newSchool.name} onChange={(e) => setNewSchool(p => ({ ...p, name: e.target.value }))} sx={{ my: 1 }} />
          <TextField fullWidth label="Código" placeholder="Ex: EB123" value={newSchool.code} onChange={(e) => setNewSchool(p => ({ ...p, code: e.target.value }))} sx={{ my: 1 }} inputProps={{ style: { textTransform: 'uppercase' } }} />
          <TextField fullWidth label="Cidade" value={newSchool.city} onChange={(e) => setNewSchool(p => ({ ...p, city: e.target.value }))} sx={{ my: 1 }} />
          <TextField fullWidth label="Morada (opcional)" value={newSchool.address} onChange={(e) => setNewSchool(p => ({ ...p, address: e.target.value }))} sx={{ my: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!newSchool.name || !newSchool.code || !newSchool.city}>Criar Escola</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle><EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Editar Escola</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            ⚠️ Precisa de 3 votos de professores da escola para aprovar as alterações.
          </Typography>
          <TextField fullWidth label="Nome" value={editSchool.name} onChange={(e) => setEditSchool(p => ({ ...p, name: e.target.value }))} sx={{ my: 1 }} />
          <TextField fullWidth label="Cidade" value={editSchool.city} onChange={(e) => setEditSchool(p => ({ ...p, city: e.target.value }))} sx={{ my: 1 }} />
          <TextField fullWidth label="Morada" value={editSchool.address} onChange={(e) => setEditSchool(p => ({ ...p, address: e.target.value }))} sx={{ my: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleEdit}>Propor Alteração</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN SCHOOL PAGE
// ═══════════════════════════════════════════════════════════════
const SchoolPage = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [currentTab, setCurrentTab] = useState(0);
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newActivity, setNewActivity] = useState({
    title: '', description: '', category: 'escola', subject: '',
    classGroup: '', scheduledDate: '', scheduledTime: '', pointsValue: 10,
    isMission: false, requiresPhoto: false
  });

  const loadTabData = async (tabIndex) => {
    setLoading(true);
    setActivities([]);
    setStudents([]);
    try {
      if (user?.role === 'teacher') {
        // Tab 0: Calendar, Tab 1: Activities, Tab 2: Students, Tab 3: Schools
        if (tabIndex === 1) {
          const res = await activityAPI.getAll({ section: 'escola', status: 'pendente' });
          setActivities(res.data?.data || []);
        } else if (tabIndex === 2) {
          const res = await userAPI.getStudents();
          setStudents(res.data?.data || []);
        }
      } else {
        const params = tabIndex === 0 ? { section: 'escola', status: 'pendente' } :
                      tabIndex === 1 ? { section: 'escola', status: 'concluida' } :
                      { section: 'escola', status: 'validada' };
        const res = await activityAPI.getAll(params);
        setActivities(res.data?.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'teacher' && (currentTab === 1 || currentTab === 2)) {
      loadTabData(currentTab);
    } else if (user?.role !== 'teacher') {
      loadTabData(currentTab);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, user]);

  const isTeacher = user?.role === 'teacher';

  const teacherTabs = [
    { label: 'Calendário', icon: <CalendarIcon sx={{ fontSize: 18 }} /> },
    { label: 'Atividades', icon: <AssignmentIcon sx={{ fontSize: 18 }} /> },
    { label: 'Alunos', icon: <PeopleIcon sx={{ fontSize: 18 }} /> },
    { label: 'Escolas', icon: <SchoolIcon sx={{ fontSize: 18 }} /> }
  ];

  const studentTabs = [
    { label: 'Pendentes', icon: <AssignmentIcon sx={{ fontSize: 18 }} /> },
    { label: 'Concluídas', icon: <CheckIcon sx={{ fontSize: 18 }} /> },
    { label: 'Validadas', icon: <StarIcon sx={{ fontSize: 18 }} /> }
  ];

  const handleCreateActivity = async () => {
    try {
      await activityAPI.create(newActivity);
      setDialogOpen(false);
      setNewActivity({ title: '', description: '', category: 'escola', subject: '', classGroup: '', scheduledDate: '', scheduledTime: '', pointsValue: 10, isMission: false, requiresPhoto: false });
      loadTabData(currentTab);
      enqueueSnackbar('Atividade criada!', { variant: 'success' });
    } catch (e) { console.error(e); }
  };

  const handleComplete = async (activityId) => {
    try {
      await activityAPI.complete(activityId);
      loadTabData(currentTab);
      enqueueSnackbar('Atividade concluída!', { variant: 'success' });
    } catch (e) { console.error(e); }
  };

  const handleValidate = async (activityId, studentId, approved) => {
    try {
      await activityAPI.validate(activityId, { studentId, approved });
      loadTabData(currentTab);
      enqueueSnackbar(approved ? 'Validado!' : 'Rejeitado!', { variant: approved ? 'success' : 'warning' });
    } catch (e) { console.error(e); }
  };

  const filteredActivities = (activities || []).filter(a =>
    a.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredStudents = (students || []).filter(s =>
    s.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      <AppHeader title="Escola" showBack showProfile={false} />

      <CustomTabBar
        tabs={isTeacher ? teacherTabs : studentTabs}
        activeTab={currentTab}
        onTabChange={(idx) => { setCurrentTab(idx); setSearchQuery(''); }}
      />

      <Box sx={{ px: 2, pt: 2 }}>
        {/* Teacher: Calendar Tab */}
        {isTeacher && currentTab === 0 && (
          <TeacherCalendar enqueueSnackbar={enqueueSnackbar} />
        )}

        {/* Teacher: Schools Management Tab */}
        {isTeacher && currentTab === 3 && (
          <SchoolsManagement enqueueSnackbar={enqueueSnackbar} />
        )}

        {/* Teacher: Students Tab */}
        {isTeacher && currentTab === 2 && (
          <Box>
            <TextField fullWidth size="small" placeholder="Pesquisar alunos..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ mb: 2 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
            {filteredStudents.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
                <Typography fontWeight={600} sx={{ mt: 1 }} color="text.secondary">Nenhum aluno inscrito</Typography>
                <Typography variant="body2" color="text.secondary">Nenhum aluno da tua escola está registado.</Typography>
              </Paper>
            ) : (
              <List>
                {filteredStudents.map(student => (
                  <ListItem key={student._id} sx={{ bgcolor: 'white', borderRadius: 2, mb: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <Avatar sx={{ mr: 1.5, bgcolor: 'primary.light' }}>{student.fullName?.charAt(0)}</Avatar>
                    <ListItemText primary={student.fullName} secondary={`${student.grade}º ano`} />
                    <Chip label={`${student.totalPoints || 0} pts`} size="small" color="primary" />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* Activities Tab (Teacher tab 1, Student tabs 0-2) */}
        {!(isTeacher && (currentTab === 0 || currentTab === 2 || currentTab === 3)) && (
          <Box>
            {(isTeacher || currentTab === 0) && (
              <TextField fullWidth size="small" placeholder="Pesquisar atividades..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ mb: 2 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
            )}

            {loading ? (
              <Typography textAlign="center" sx={{ py: 4 }} color="text.secondary">A carregar...</Typography>
            ) : filteredActivities.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <AssignmentIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
                <Typography fontWeight={600} sx={{ mt: 1 }} color="text.secondary">Sem atividades</Typography>
                <Typography variant="body2" color="text.secondary">
                  {isTeacher ? 'Crie uma atividade usando o botão +' : 'Aguarda que o professor atribua atividades!'}
                </Typography>
              </Paper>
            ) : (
              filteredActivities.map(activity => (
                <Card key={activity._id} sx={{ mb: 1.5 }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography fontWeight={600}>{activity.title}</Typography>
                    {activity.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{activity.description}</Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                      <Chip size="small" label={activity.category} variant="outlined" />
                      <Chip size="small" label={`${activity.pointsValue || 0} pts`} color="primary" />
                      {activity.subject && <Chip size="small" label={activity.subject} color="secondary" variant="outlined" />}
                      {activity.isMission && <Chip size="small" label="Missão" color="warning" />}
                    </Box>

                    {!isTeacher && activity.status === 'pendente' && (
                      <Box sx={{ mt: 1.5 }}>
                        <Button variant="contained" size="small" fullWidth startIcon={<CheckIcon />}
                          onClick={() => handleComplete(activity._id)}>Concluir</Button>
                      </Box>
                    )}

                    {isTeacher && activity.completedBy?.length > 0 && (
                      <Box sx={{ mt: 1.5 }}>
                        {activity.completedBy.map((completion, idx) => {
                          const studentName = completion.userName || completion.user?.fullName || 'Aluno';
                          const studentId = completion.user?._id || completion.user;
                          return (
                            <Box key={idx} sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F5F5F5', p: 1, borderRadius: 2 }}>
                              <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.light', fontSize: 12 }}>
                                {studentName?.charAt(0) || '?'}
                              </Avatar>
                              <Typography variant="body2" sx={{ flex: 1 }}>
                                {studentName}
                                {completion.userGrade && <Typography component="span" variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>({completion.userGrade}º ano)</Typography>}
                                {!completion.validatedBy && <Typography component="span" variant="caption" sx={{ ml: 1, color: 'warning.main' }}>⏳ Pendente</Typography>}
                              </Typography>
                              {completion.validatedBy ? (
                                <Chip label="✓" size="small" color="success" />
                              ) : (
                                <>
                                  <IconButton size="small" color="success" onClick={() => handleValidate(activity._id, studentId, true)}><CheckIcon fontSize="small" /></IconButton>
                                  <IconButton size="small" color="error" onClick={() => handleValidate(activity._id, studentId, false)}><CloseIcon fontSize="small" /></IconButton>
                                </>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}
      </Box>

      {/* FAB: Create Activity (teacher, activities tab only) */}
      {isTeacher && currentTab === 1 && (
        <Fab color="primary" onClick={() => setDialogOpen(true)} sx={{ position: 'fixed', bottom: 86, right: 16 }}><AddIcon /></Fab>
      )}

      {/* Create Activity Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nova Atividade</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Título" value={newActivity.title} onChange={(e) => setNewActivity(p => ({ ...p, title: e.target.value }))} sx={{ my: 1 }} />
          <TextField fullWidth label="Descrição" value={newActivity.description} onChange={(e) => setNewActivity(p => ({ ...p, description: e.target.value }))} sx={{ my: 1 }} multiline rows={2} />
          <TextField fullWidth label="Disciplina" value={newActivity.subject} onChange={(e) => setNewActivity(p => ({ ...p, subject: e.target.value }))} sx={{ my: 1 }} />
          <TextField fullWidth select label="Ano/Turma" value={newActivity.classGroup} onChange={(e) => setNewActivity(p => ({ ...p, classGroup: e.target.value }))} sx={{ my: 1 }}>
            {[5,6,7,8,9,10,11,12].map(g => <MenuItem key={g} value={String(g)}>{g}.º ano</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Pontos" type="number" value={newActivity.pointsValue} onChange={(e) => setNewActivity(p => ({ ...p, pointsValue: parseInt(e.target.value) || 10 }))} sx={{ my: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateActivity} disabled={!newActivity.title}>Criar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchoolPage;
