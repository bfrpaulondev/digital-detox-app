import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Avatar,
  Divider, Chip, List, ListItem, ListItemIcon, ListItemText, Grid
} from '@mui/material';
import { Person, Email, CalendarToday, Phone, Star, Edit, Save } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AppHeader from '../../components/layout/AppHeader';
import { userAPI } from '../../services/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '' });
  const [parentCode, setParentCode] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ fullName: user.fullName || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const res = await userAPI.updateProfile(user._id, form);
      if (res.data.success) {
        updateUser(res.data.data);
        setEditing(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLinkChild = async () => {
    if (!parentCode) return;
    setLinking(true);
    try {
      const res = await userAPI.linkChild(parentCode);
      if (res.data.success) {
        updateUser({ ...user, linkedChildren: [...(user.linkedChildren || []), res.data.data] });
        setParentCode('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLinking(false);
    }
  };

  const roleLabels = { student: 'Aluno(a)', teacher: 'Professor(a)', parent: 'Pai/Mãe' };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      <AppHeader title="Perfil" showBack showProfile={false} />

      <Box sx={{ px: 2, pt: 2 }}>
        {/* Profile Card */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32, mx: 'auto', mb: 2 }}>
              {user?.fullName?.charAt(0)}
            </Avatar>
            <Typography variant="h5" fontWeight={700}>{user?.fullName}</Typography>
            <Chip label={roleLabels[user?.role]} color="primary" size="small" sx={{ mt: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {user?.school?.name || ''}
            </Typography>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>Informações</Typography>
              <Button size="small" startIcon={editing ? <Save /> : <Edit />} onClick={() => editing ? handleSave() : setEditing(true)}>
                {editing ? 'Guardar' : 'Editar'}
              </Button>
            </Box>

            {editing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField fullWidth label="Nome Completo" value={form.fullName} onChange={(e) => setForm(p => ({ ...p, fullName: e.target.value }))} />
                <TextField fullWidth label="Telefone" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
              </Box>
            ) : (
              <List dense>
                <ListItem><ListItemIcon><Email sx={{ color: 'grey.400' }} /></ListItemIcon><ListItemText primary={user?.email} secondary="Email" /></ListItem>
                <ListItem><ListItemIcon><CalendarToday sx={{ color: 'grey.400' }} /></ListItemIcon><ListItemText primary={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('pt-PT') : '-'} secondary="Data de Nascimento" /></ListItem>
                <ListItem><ListItemIcon><Phone sx={{ color: 'grey.400' }} /></ListItemIcon><ListItemText primary={user?.phone || '-'} secondary="Telefone" /></ListItem>
              </List>
            )}
          </CardContent>
        </Card>

        {/* Parent Code (for students 10-14) */}
        {user?.role === 'student' && user?.parentCode && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Código para Pais</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Partilhe este código com o seu pai/mãe:
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#E8EAF6', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={800} color="primary.main" letterSpacing={2}>
                  {user.parentCode}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Link child (for parents) */}
        {user?.role === 'parent' && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Associar Filho(a)</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Código do filho(a)"
                  value={parentCode}
                  onChange={(e) => setParentCode(e.target.value)}
                />
                <Button variant="contained" onClick={handleLinkChild} disabled={!parentCode || linking}>
                  Associar
                </Button>
              </Box>
              {user?.linkedChildren?.length > 0 && (
                <List dense sx={{ mt: 1 }}>
                  {user.linkedChildren.map(child => (
                    <ListItem key={child._id}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14, mr: 1 }}>
                        {child.fullName?.charAt(0)}
                      </Avatar>
                      <ListItemText primary={child.fullName} secondary={`${child.grade}º ano`} />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {user?.role === 'student' && (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Estatísticas</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="h5" fontWeight={700} color="primary.main">{user.totalPoints}</Typography>
                  <Typography variant="caption" color="text.secondary">Pontos</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h5" fontWeight={700} color="secondary.main">{user.level}</Typography>
                  <Typography variant="caption" color="text.secondary">Nível</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h5" fontWeight={700} color="warning.main">{user.currentStreak}</Typography>
                  <Typography variant="caption" color="text.secondary">Streak</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default ProfilePage;
