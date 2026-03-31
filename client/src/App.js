import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme/theme';
import LoadingSpinner from './components/common/LoadingSpinner';
import BottomNav from './components/layout/BottomNav';

// Lazy load pages
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const SchoolPage = lazy(() => import('./pages/School/SchoolPage'));
const PetPage = lazy(() => import('./pages/Pet/PetPage'));
const OutsidePage = lazy(() => import('./pages/Outside/OutsidePage'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));
const NotificationsPage = lazy(() => import('./pages/Dashboard/NotificationsPage'));
const RankingPage = lazy(() => import('./pages/Dashboard/RankingPage'));

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" />;
  return children;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/school" element={<ProtectedRoute roles={['student', 'teacher']}><SchoolPage /></ProtectedRoute>} />
          <Route path="/pet" element={<ProtectedRoute roles={['student']}><PetPage /></ProtectedRoute>} />
          <Route path="/outside" element={<ProtectedRoute roles={['student', 'parent']}><OutsidePage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/ranking" element={<ProtectedRoute roles={['student', 'teacher']}><RankingPage /></ProtectedRoute>} />

          {/* Default */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </Suspense>
      {isAuthenticated && <BottomNav />}
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={3000}
        >
          <AppContent />
        </SnackbarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
