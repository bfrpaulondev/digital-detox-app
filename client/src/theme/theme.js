import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6C63FF',
      light: '#9D97FF',
      dark: '#4A42CC',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#FF6584',
      light: '#FF8FA3',
      dark: '#CC5069',
      contrastText: '#FFFFFF'
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C'
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00'
    },
    error: {
      main: '#F44336',
      light: '#E57373',
      dark: '#D32F2F'
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#2D3748',
      secondary: '#718096'
    },
    school: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2'
    },
    pet: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00'
    },
    outside: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2rem'
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.5rem'
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.25rem'
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.1rem'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1rem'
    },
    h6: {
      fontWeight: 600,
      fontSize: '0.875rem'
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.5
    },
    button: {
      textTransform: 'none',
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.9375rem'
        },
        contained: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: 'none'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 600
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10
          }
        }
      }
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 70,
          borderTop: '1px solid #E2E8F0'
        }
      }
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 'auto',
          padding: '6px 0',
          '&.Mui-selected': {
            color: '#6C63FF'
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }
      }
    }
  }
});

export default theme;
