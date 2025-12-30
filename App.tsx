import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Landing from './pages/public/Landing';
import MaintenanceGateway from './pages/public/MaintenanceGateway';
import Layout from './components/Layout';
import DashboardPage from './pages/director/Dashboard.tsx';
import CreateStreamingWizard from './pages/director/CreateStreamingWizard.tsx';
import MediaLibraryPage from './pages/director/MediaLibrary.tsx';
import SchedulingPage from './pages/director/Scheduling.tsx';
import AudioPreferencesView from './pages/director/AudioPreferencesView.tsx'; // NEW
import StreamingPlayersPage from './pages/director/Radios.tsx';
import ClientsListPage from './pages/director/ClientsList.tsx';
import UsersPage from './pages/director/Users.tsx';
import PlayerPage from './pages/client/PlayerPage.tsx';
import AdManager from './pages/director/AdManager.tsx';
import { User, UserRole } from './types';
import { I18nProvider } from './contexts/I18nContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TourProvider } from './contexts/TourContext';
import ErrorBoundary from './components/ErrorBoundary';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem('lomuz_unlocked') === 'true');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('landing'); 
  const [urlStreamId, setUrlStreamId] = useState<string | null>(null);

  // Lógica de roteamento baseada em URL para o Player
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/player/')) {
        const id = path.replace('/player/', '');
        if (id) {
            setUrlStreamId(id);
            setCurrentPage('player');
        }
    }
  }, []);

  const handleLogin = (role: UserRole, user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentPage(role === UserRole.DIRECTOR ? 'dashboard' : 'player');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentPage('landing');
  };

  if (!isUnlocked) {
    return <MaintenanceGateway onUnlock={() => setIsUnlocked(true)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing': return <Landing onNavigate={setCurrentPage} onLogin={handleLogin} />;
      case 'login': return <Login onLogin={handleLogin} onNavigate={setCurrentPage} />;
      case 'dashboard': return <DashboardPage />;
      case 'streaming-fleet': return <StreamingPlayersPage onNavigate={setCurrentPage} />;
      case 'clients-list': return <ClientsListPage onNavigate={setCurrentPage} />;
      case 'create-radio': 
      case 'create-radio-guest': 
          return <CreateStreamingWizard onFinish={() => isAuthenticated ? setCurrentPage('streaming-fleet') : setCurrentPage('landing')} />;
      case 'media': return <MediaLibraryPage />;
      case 'marketing-ads': return <AdManager />;
      case 'scheduling': return <SchedulingPage />;
      case 'settings': return <AudioPreferencesView />; // UPDATED to new view
      case 'users': return <UsersPage />;
      case 'player': return <PlayerPage streamId={urlStreamId} onLogout={handleLogout} />;
      default: return <DashboardPage />;
    }
  };

  // Se o player for acessado via URL, não exige autenticação (acesso público)
  if (currentPage === 'player') {
    return <PlayerPage streamId={urlStreamId} onLogout={handleLogout} />;
  }

  if (!isAuthenticated) {
     if (currentPage === 'login') return <Login onLogin={handleLogin} onNavigate={setCurrentPage} />;
     if (currentPage === 'create-radio-guest') return renderPage();
     return <Landing onNavigate={setCurrentPage} onLogin={handleLogin} />;
  }

  return (
    <Layout 
      user={currentUser!} 
      onNavigate={setCurrentPage} 
      onLogout={handleLogout}
      currentPage={currentPage}
    >
      {renderPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <TourProvider>
            <AppContent />
          </TourProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;