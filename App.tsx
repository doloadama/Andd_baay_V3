import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import Analytics from './components/Analytics';
import Profile from './components/Profile';
import Finance from './components/Finance';
import VoiceAssistant from './components/VoiceAssistant';
import AuthModal from './components/AuthModal';
import ImageEditor from './components/ImageEditor';
import { View, User } from './types';
import * as authService from './services/authService';
import ChatBot from './components/ChatBot';
import { t as translate, Language } from './utils/i18n';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>((localStorage.getItem('language') as Language) || 'en');

  const t = useCallback((key: any, options?: any) => {
    return translate(key, language, options);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await authService.getProfile();
        if (currentUser) {
          setUser(currentUser);
        } else {
          setIsAuthModalOpen(true);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
        setIsAuthModalOpen(true);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setView(View.DASHBOARD);
    setIsAuthModalOpen(true);
  };
  
  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const renderView = () => {
    if (!user) return null;

    const commonProps = { user, t, lang: language };

    switch (view) {
      case View.DASHBOARD:
        return <Dashboard {...commonProps} />;
      case View.MARKETPLACE:
        return <Marketplace {...commonProps} />;
      case View.ANALYTICS:
        return <Analytics {...commonProps} />;
      case View.FINANCE:
        return <Finance {...commonProps} />;
      case View.PROFILE:
        return <Profile {...commonProps} onProfileUpdate={handleProfileUpdate} />;
      case View.IMAGE_STUDIO:
        return <ImageEditor {...commonProps} />;
      case View.VOICE_ASSISTANT:
        return <VoiceAssistant {...commonProps} />;
      default:
        return <Dashboard {...commonProps} />;
    }
  };

  if (loading) {
      return <div className="flex items-center justify-center h-screen bg-gray-100"><div className="text-xl font-semibold text-gray-700">{t('loading')}</div></div>;
  }

  if (!user) {
    return <AuthModal show={isAuthModalOpen} onLoginSuccess={handleLoginSuccess} onClose={() => setIsAuthModalOpen(false)} t={t} lang={language} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
      <Sidebar currentView={view} setView={setView} userRole={user.role} t={t} lang={language} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={handleLogout} t={t} lang={language} setLanguage={setLanguage} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {renderView()}
          </div>
        </main>
      </div>
      <ChatBot t={t} lang={language} />
    </div>
  );
};

export default App;
