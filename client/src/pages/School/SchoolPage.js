import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Tabs, Tab, List, ListItem,
  ListItemText, Chip, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Avatar,
  IconButton, Fab, Paper, InputAdornment, MenuItem
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Star as StarIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AppHeader from '../../components/layout/AppHeader';
import { activityAPI, userAPI } from '../../services/api';

const emptyStateMessages = {
  0: { icon: <AssignmentIcon sx={{ fontSize: 48, color: 'grey.300' }} />, title: 'Sem atividades pendentes', desc: 'Aguarda que o teu professor atribua atividades!' },
  1: { icon: <CheckIcon sx={{ fontSize: 48, color: 'grey.300' }} />, title: 'Sem atividades concluídas', desc: 'Conclui atividades pendentes para ver aqui!' },
  2: { icon: <StarIcon sx={{ fontSize: 48, color: 'grey.300' }} />, title: 'Sem atividades validadas', desc: 'Quando o professor validar as tuas atividades, aparecem aqui!' }
};

const SchoolPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
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

  const loadData = useCallback(async () => {
    setLoading(true);
    setActivities([]);
    setStudents([]);
    try {
      if (user?.role === 'teacher') {
        if (tab === 2) {
          const studentsRes = await userAPI.getStudents();
          setStudents(studentsRes.data?.data || []);
        } else {
          const params = tab === 0 ? { section: 'escola', status: 'pendente' } :
                        { section: 'escola', status: 'concluida' };
          const res = await activityAPI.getAll(params);
          setActivities(res.data?.data || []);
        }
      } else {
        const params = tab === 0 ? { section: 'escola', status: 'pendente' } :
                      tab === 1 ? { section: 'escola', status: 'concluida' } :
                      { section: 'escola', status: 'validada' };
        const res = await activityAPI.getAll(params);
        setActivities(res.data?.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [tab, user?.role]);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadData]);

  const handleCreateActivity = async () => {
    try {
      await activityAPI.create(newActivity);
      setDialogOpen(false);
      setNewActivity({ title: '', description: '', category: 'escola', subject: '', classGroup: '', scheduledDate: '', scheduledTime: '', pointsValue: 10, isMission: false, requiresPhoto: false });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplete = async (activityId) => {
    try {
      await activityAPI.complete(activityId);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleValidate = async (activityId, studentId, approved) => {
    try {
      await activityAPI.validate(activityId, { studentId, approved });
      loadData();
    } catch (e) { console.error(e); }
  };

  const filteredActivities = (activities || []).filter(a =>
    a.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      <AppHeader title="Escola" showBack showProfile={false} />

      <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: 56, zIndex: 10 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setSearchQuery(''); }}
          variant="fullWidth"
          sx={{ '& .MuiTab-root': { minHeight: 56 } }}
        >
          {user?.role === 'teacher' ? (
            <>
              <Tab label="Pendentes" icon={<AssignmentIcon />} iconPosition="start" />
              <Tab label="Concluídas" icon={<CheckIcon />} iconPosition="start" />
              <Tab label="Alunos" icon={<PeopleIcon />} iconPosition="start" />
            </>
          ) : (
            <>
              <Tab label="Pendentes" icon={<AssignmentIcon />} iconPosition="start" />
              <Tab label="Concluídas" icon={<CheckIcon />} iconPosition="start" />
              <Tab label="Validadas" icon={<StarIcon />} iconPosition="start" />
            </>
          )}
        </Tabs>
      </Box>

      <Box sx={{ px: 2, pt: 2 }}>
        {/* Students Tab (Teacher only) */}
        {tab === 2 && user?.role === 'teacher' && (
          <>
            <TextField fullWidth size="small" placeholder="Pesquisar alunos..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ mb: 2 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
            {students.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
                <Typography color="text.secondary">Nenhum aluno inscrito na tua escola</Typography>
              </Paper>
            ) : (
              <List>
                {students.filter(s => s.fullName?.toLowerCase().includes(searchQuery.toLowerCase())).map(student => (
                  <ListItem key={student._id} sx={{ bgcolor: 'white', borderRadius: 2, mb: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <Avatar sx={{ mr: 1.5, bgcolor: 'primary.light' }}>{student.fullName?.charAt(0)}</Avatar>
                    <ListItemText primary={student.fullName} secondary={`${student.grade}º ano`} />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}

        {/* Activities Tabs (not teacher's student tab) */}
        {!(tab === 2 && user?.role === 'teacher') && (
          <>
            {(user?.role === 'teacher' && tab === 0) && (
              <TextField fullWidth size="small" placeholder="Pesquisar atividades..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ mb: 2 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
            )}

            {loading ? (
              <Typography textAlign="center" sx={{ py: 4 }} color="text.secondary">A carregar...</Typography>
            ) : filteredActivities.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                {emptyStateMessages[tab]?.icon}
                <Typography fontWeight={600} sx={{ mt: 1 }} color="text.secondary">{emptyStateMessages[tab]?.title}</Typography>
                <Typography variant="body2" color="text.secondary">{emptyStateMessages[tab]?.desc}</Typography>
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
                      <Chip size="small" label={`${activity.pointsValue} pts`} color="primary" />
                      {activity.subject && <Chip size="small" label={activity.subject} color="secondary" variant="outlined" />}
                      {activity.isMission && <Chip size="small" label="Missão" color="warning" />}
                    </Box>

                    {user?.role === 'student' && activity.status === 'pendente' && (
                      <Box sx={{ mt: 1.5 }}>
                        <Button variant="contained" size="small" fullWidth startIcon={<CheckIcon />}
                          onClick={() => handleComplete(activity._id)}>Concluir</Button>
                      </Box>
                    )}

                    {user?.role === 'teacher' && tab === 1 && activity.completedBy?.map(completion => (
                      <Box key={completion.user?._id} sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F5F5F5', p: 1, borderRadius: 2 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.light', fontSize: 12 }}>{completion.user?.fullName?.charAt(0)}</Avatar>
                        <Typography variant="body2" sx={{ flex: 1 }}>{completion.user?.fullName}</Typography>
                        {completion.validatedBy ? (
                          <Chip label="Validado" size="small" color="success" />
                        ) : (
                          <>
                            <IconButton size="small" color="success" onClick={() => handleValidate(activity._id, completion.user?._id, true)}><CheckIcon fontSize="small" /></IconButton>
                            <IconButton size="small" color="error" onClick={() => handleValidate(activity._id, completion.user?._id, false)}><CloseIcon fontSize="small" /></IconButton>
                          </>
                        )}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </>
        )}
      </Box>

      {user?.role === 'teacher' && tab === 0 && (
        <Fab color="primary" onClick={() => setDialogOpen(true)} sx={{ position: 'fixed', bottom: 86, right: 16 }}><AddIcon /></Fab>
      )}

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
