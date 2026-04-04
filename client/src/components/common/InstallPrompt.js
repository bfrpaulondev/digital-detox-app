import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';

// Store the deferred prompt globally so it can be accessed from anywhere
let deferredPrompt = null;

// Capture the beforeinstallprompt event at the window level
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('PWA: Install prompt captured');
  });
}

const InstallPrompt = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Don't show if already installed or if in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone
      || document.referrer.includes('android-app://');

    if (isStandalone) return;

    // Don't show if already dismissed
    const dismissed = localStorage.getItem('offout_install_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 7 days if dismissed
      const daysSinceDismiss = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) return;
    }

    // Show modal after a small delay for better UX
    const timer = setTimeout(() => {
      // For iOS/Safari, show manual instructions (no beforeinstallprompt)
      const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
      const isSafari = /safari/.test(window.navigator.userAgent.toLowerCase()) && !/chrome/.test(window.navigator.userAgent.toLowerCase());

      if ((isIOS || isSafari) && !deferredPrompt) {
        // iOS doesn't support beforeinstallprompt, show instructions
        setOpen(true);
      } else if (deferredPrompt) {
        // Android/Chrome - we have the install prompt
        setOpen(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      // Android/Chrome - trigger the native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA: Install outcome: ${outcome}`);
      deferredPrompt = null;
      setOpen(false);

      if (outcome === 'accepted') {
        localStorage.setItem('offout_install_dismissed', Date.now().toString());
      }
    } else {
      // iOS/Safari - close modal, the instructions are already shown
      setOpen(false);
      localStorage.setItem('offout_install_dismissed', Date.now().toString());
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setOpen(false);
    localStorage.setItem('offout_install_dismissed', Date.now().toString());
  }, []);

  const isIOS = typeof window !== 'undefined' && /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

  return (
    <Dialog
      open={open}
      onClose={handleDismiss}
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxWidth: 380,
          mx: 2,
          overflow: 'visible'
        }
      }}
      slotProps={{
        backdrop: {
          sx: { backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }
        }
      }}
    >
      {/* Close button */}
      <IconButton
        onClick={handleDismiss}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          color: 'grey.500',
          zIndex: 1
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 3 }}>
        {/* Logo */}
        <Box
          component="img"
          src={process.env.PUBLIC_URL + '/app-logo.png'}
          alt="OFFOUT"
          sx={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            mb: 1.5,
            display: 'block',
            mx: 'auto',
            boxShadow: '0 4px 16px rgba(255,152,0,0.3)'
          }}
        />
        <Typography variant="h6" fontWeight={800} sx={{ color: 'primary.main' }}>
          Instalar o OFFOUT
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
          Instala a app para uma experiência muito melhor!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
          ✅ Funciona offline
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
          ✅ Acesso rápido do ecrã inicial
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
          ✅ Sem barra de navegação
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          ✅ Notificações nativas
        </Typography>

        {/* iOS-specific instructions */}
        {isIOS && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: '#FFF3E0',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <PhoneIphoneIcon sx={{ color: '#FF9800', fontSize: 28 }} />
            <Typography variant="body2" sx={{ textAlign: 'left', color: '#E65100' }}>
              Toca no botão <strong>⬆️ Partilhar</strong> no Safari e escolhe <strong>"Adicionar ao Ecrã Inicial"</strong>
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3, gap: 1 }}>
        <Button
          onClick={handleDismiss}
          variant="outlined"
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            px: 3,
            fontWeight: 600
          }}
        >
          Agora não
        </Button>
        <Button
          onClick={handleInstall}
          variant="contained"
          startIcon={<GetAppIcon />}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            px: 3,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #FF9800, #F57C00)',
            boxShadow: '0 4px 12px rgba(255,152,0,0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #F57C00, #E65100)',
              boxShadow: '0 6px 16px rgba(255,152,0,0.5)'
            }
          }}
        >
          Instalar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstallPrompt;
