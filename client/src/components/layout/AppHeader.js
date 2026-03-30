import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Avatar, Box, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import PointsDisplay from '../common/PointsDisplay';

const AppHeader = ({ title, showBack, showNotifications, showProfile, notificationCount }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileAnchor, setProfileAnchor] = React.useState(null);

  const roleLabels = {
    student: 'Aluno',
    teacher: 'Professor',
    parent: 'Pai/Mãe'
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary'
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        {showBack && (
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        )}

        {showBack ? (
          <Typography variant="h6" noWrap sx={{ fontWeight: 600, flex: 1 }}>
            {title}
          </Typography>
        ) : (
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: 'primary.main' }}>
              Digital Detox
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {roleLabels[user?.role]}
            </Typography>
          </Box>
        )}

        {user?.role === 'student' && (
          <PointsDisplay
            points={user.totalPoints}
            level={user.level}
            streak={user.currentStreak}
            size="small"
          />
        )}

        {showNotifications && (
          <IconButton
            onClick={() => navigate('/notifications')}
            sx={{ ml: 1 }}
          >
            <Badge badgeContent={notificationCount || 0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        )}

        {showProfile !== false && (
          <>
            <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} sx={{ ml: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                {user?.fullName?.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={() => setProfileAnchor(null)}
            >
              <MenuItem onClick={() => { setProfileAnchor(null); navigate('/profile'); }}>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Perfil</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { setProfileAnchor(null); navigate('/settings'); }}>
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Definições</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { setProfileAnchor(null); logout(); navigate('/login'); }}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Sair</ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
