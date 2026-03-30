import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, List, ListItem, ListItemIcon, ListItemText,
  ListItemButton, Divider, Chip, Button, Paper
} from '@mui/material';
import {
  School as SchoolIcon,
  EmojiEvents as EmojiEventsIcon,
  Pets as PetsIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import AppHeader from '../../components/layout/AppHeader';
import { dashboardAPI } from '../../services/api';

const iconMap = {
  school_alert: <SchoolIcon color="primary" />,
  activity_validated: <CheckIcon color="success" />,
  achievement: <EmojiEventsIcon sx={{ color: '#FFD700' }} />,
  pet_update: <PetsIcon color="warning" />,
  parent_alert: <InfoIcon color="info" />,
  reminder: <WarningIcon color="warning" />
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await dashboardAPI.getNotifications({ limit: 50 });
      setNotifications(res.data.data.notifications);
      setTotal(res.data.data.total);
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await dashboardAPI.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      <AppHeader title="Notificações" showBack showProfile={false} />
      <Box sx={{ px: 2, pt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">{total} notificação(ões)</Typography>
          <Button size="small" onClick={markAllRead}>Marcar todas como lidas</Button>
        </Box>

        {notifications.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <InfoIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
            <Typography color="text.secondary">Sem notificações</Typography>
          </Paper>
        ) : (
          <List>
            {notifications.map((notif, i) => (
              <React.Fragment key={notif._id}>
                <ListItemButton
                  sx={{
                    bgcolor: notif.isRead ? 'transparent' : '#E8EAF6',
                    borderRadius: 2,
                    mb: 1
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {iconMap[notif.type] || <InfoIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={notif.title}
                    secondary={notif.message}
                    primaryTypographyProps={{ fontWeight: notif.isRead ? 400 : 600, variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1, whiteSpace: 'nowrap' }}>
                    {new Date(notif.createdAt).toLocaleDateString('pt-PT')}
                  </Typography>
                </ListItemButton>
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default NotificationsPage;
