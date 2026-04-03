import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#FFD700',
      light: '#FFE44D',
      dark: '#DAA520',
      contrastText: '#333333'
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C'
    },
    warning: {
      main: '#FF6F00',
      light: '#FF9E40',
      dark: '#E65100'
    },
    error: {
      main: '#F44336',
      light: '#E57373',
      dark: '#D32F2F'
    },
    background: {
      default: '#FFF8F0',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#2D3748',
      secondary: '#718096'
    },
    school: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00'
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
          boxShadow: '0 4px 12px rgba(255,152,0,0.25)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(255,152,0,0.35)'
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
            color: '#FF9800'
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(255,152,0,0.1)'
        }
      }
    }
  }
});

export default theme;
