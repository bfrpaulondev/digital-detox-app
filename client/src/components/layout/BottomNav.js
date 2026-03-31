import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import {
  Home as HomeIcon,
  School as SchoolIcon,
  Pets as PetsIcon,
  NaturePeople as OutsideIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getNavItems = () => {
    const items = [
      { label: 'Início', icon: <HomeIcon />, path: '/dashboard' },
      { label: 'Escola', icon: <SchoolIcon />, path: '/school', roles: ['student', 'teacher'] },
      { label: 'Animal', icon: <PetsIcon />, path: '/pet', roles: ['student'] },
      { label: 'Fora', icon: <OutsideIcon />, path: '/outside', roles: ['student', 'parent'] }
    ];

    return items.filter(item => !item.roles || item.roles.includes(user?.role));
  };

  const navItems = getNavItems();

  const currentValue = navItems.findIndex(item => location.pathname.startsWith(item.path));

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        pb: 'env(safe-area-inset-bottom)'
      }}
      elevation={3}
    >
      <BottomNavigation
        value={currentValue >= 0 ? currentValue : 0}
        onChange={(_, newValue) => {
          navigate(navItems[newValue].path);
        }}
        showLabels
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
