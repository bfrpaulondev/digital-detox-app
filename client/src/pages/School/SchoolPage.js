import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, List, ListItem,
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

const emptyTeacher = {
  0: { icon: <AssignmentIcon sx={{ fontSize: 48, color: 'grey.300' }} />, title: 'Sem atividades pendentes', desc: 'Crie uma atividade usando o botão +' },
  1: { icon: <CheckIcon sx={{ fontSize: 48, color: 'grey.300' }} />, title: 'Sem atividades concluídas', desc: 'Aguarda que os alunos concluam atividades!' },
  2: { icon: <PeopleIcon sx={{ fontSize: 48, color: 'grey.300' }} />, title: 'Nenhum aluno inscrito', desc: 'Nenhum aluno da tua escola está registado.' }
};

const emptyStudent = {
  0: { icon: <AssignmentIcon sx={{ fontSize: 48, color: 'grey.300' }} />, title: 'Sem atividades pendentes', desc: 'Aguarda que o teu professor atribua atividades!' },
  1: { icon: <CheckIcon sx={{ fontSize: 48, color: 'grey.300' }} />, title: 'Sem atividades concluídas', desc: 'Conclui atividades pendentes para ver aqui!' },
  2: { icon: <StarIcon sx={{ fontSize: 48, color: 'grey.300' }} />, title: 'Sem atividades validadas', desc: 'Quando o professor validar, aparecem aqui!' }
};

function CustomTabBar({ tabs, activeTab, onTabChange }) {
  return (
    <Box sx={{
      bgcolor: 'background.paper',
      borderBottom: '2px solid',
      borderColor: 'divider',
      position: 'sticky',
      top: 56,
      zIndex: 10,
      display: 'flex'
    }}>
      {tabs.map((tab, index) => {
        const isActive = activeTab === index;
        return (
          <Box
            key={index}
            onClick={() => onTabChange(index)}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              py: 1.5,
              px: 1,
              cursor: 'pointer',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              borderBottom: isActive ? '3px solid' : '3px solid transparent',
              borderColor: isActive ? 'primary.main' : 'transparent',
              color: isActive ? 'primary.main' : 'text.secondary',
              bgcolor: isActive ? 'rgba(108, 99, 255, 0.06)' : 'transparent',
              fontWeight: isActive ? 700 : 400,
              fontSize: '0.8rem',
              transition: 'all 0.2s ease',
              '&:active': {
                bgcolor: 'rgba(108, 99, 255, 0.12)',
              }
            }}
          >
            {tab.icon}
            <Typography variant="caption" sx={{ fontWeight: 'inherit', fontSize: '0.75rem' }}>
              {tab.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

const SchoolPage = () => {
  const { user } = useAuth();
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
        if (tabIndex === 2) {
          const res = await userAPI.getStudents();
          setStudents(res.data?.data || []);
        } else {
          const params = tabIndex === 0 ? { section: 'escola', status: 'pendente' } :
                        { section: 'escola', status: 'concluida' };
          const res = await activityAPI.getAll(params);
          setActivities(res.data?.data || []);
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
    loadTabData(currentTab);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  const isTeacher = user?.role === 'teacher';
  const emptyState = isTeacher ? emptyTeacher : emptyStudent;

  const teacherTabs = [
    { label: 'Pendentes', icon: <AssignmentIcon sx={{ fontSize: 18 }} /> },
    { label: 'Concluídas', icon: <CheckIcon sx={{ fontSize: 18 }} /> },
    { label: 'Alunos', icon: <PeopleIcon sx={{ fontSize: 18 }} /> }
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
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplete = async (activityId) => {
    try {
      await activityAPI.complete(activityId);
      loadTabData(currentTab);
    } catch (e) { console.error(e); }
  };

  const handleValidate = async (activityId, studentId, approved) => {
    try {
      await activityAPI.validate(activityId, { studentId, approved });
      loadTabData(currentTab);
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
        {/* Students Tab (Teacher only) */}
        {isTeacher && currentTab === 2 && (
          <Box>
            <TextField fullWidth size="small" placeholder="Pesquisar alunos..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ mb: 2 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
            {filteredStudents.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                {emptyState[2]?.icon}
                <Typography fontWeight={600} sx={{ mt: 1 }} color="text.secondary">{emptyState[2]?.title}</Typography>
                <Typography variant="body2" color="text.secondary">{emptyState[2]?.desc}</Typography>
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

        {/* Activities (all tabs except teacher's Students tab) */}
        {!(isTeacher && currentTab === 2) && (
          <Box>
            {isTeacher && currentTab === 0 && (
              <TextField fullWidth size="small" placeholder="Pesquisar atividades..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ mb: 2 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
            )}

            {loading ? (
              <Typography textAlign="center" sx={{ py: 4 }} color="text.secondary">A carregar...</Typography>
            ) : filteredActivities.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                {emptyState[currentTab]?.icon}
                <Typography fontWeight={600} sx={{ mt: 1 }} color="text.secondary">{emptyState[currentTab]?.title}</Typography>
                <Typography variant="body2" color="text.secondary">{emptyState[currentTab]?.desc}</Typography>
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

                    {/* Student: Complete button */}
                    {!isTeacher && activity.status === 'pendente' && (
                      <Box sx={{ mt: 1.5 }}>
                        <Button variant="contained" size="small" fullWidth startIcon={<CheckIcon />}
                          onClick={() => handleComplete(activity._id)}>Concluir</Button>
                      </Box>
                    )}

                    {/* Teacher: Validate completed activities (tab 1) */}
                    {isTeacher && currentTab === 1 && activity.completedBy?.length > 0 && (
                      <Box sx={{ mt: 1.5 }}>
                        {activity.completedBy.map((completion, idx) => {
                          const studentName = completion.user?.toString?.() || completion.user || 'Aluno';
                          const isObjectId = typeof completion.user === 'string' && completion.user.length === 24;
                          return (
                            <Box key={idx} sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F5F5F5', p: 1, borderRadius: 2 }}>
                              <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.light', fontSize: 12 }}>
                                {typeof studentName === 'string' ? studentName.charAt(0) : '?'}
                              </Avatar>
                              <Typography variant="body2" sx={{ flex: 1 }}>
                                {isObjectId ? 'Aluno' : studentName}
                                {!completion.validatedBy && <Typography component="span" variant="caption" sx={{ ml: 1, color: 'warning.main' }}>⏳ Pendente validação</Typography>}
                              </Typography>
                              {completion.validatedBy ? (
                                <Chip label="Validado ✓" size="small" color="success" />
                              ) : (
                                <>
                                  <IconButton size="small" color="success" onClick={() => handleValidate(activity._id, isObjectId ? completion.user : undefined, true)}><CheckIcon fontSize="small" /></IconButton>
                                  <IconButton size="small" color="error" onClick={() => handleValidate(activity._id, isObjectId ? completion.user : undefined, false)}><CloseIcon fontSize="small" /></IconButton>
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

      {isTeacher && currentTab === 0 && (
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
