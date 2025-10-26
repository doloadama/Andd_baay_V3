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
import SiteManagement from './components/Banner';
import SiteDetail from './components/SiteDetail';
import CartView from './components/CartView';
import { View, User, CartItem } from './types';
import * as authService from './services/authService';
import ChatBot from './components/ChatBot';
import { t as translate, Language } from './utils/i18n';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>((localStorage.getItem('language') as Language) || 'en');
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHarvestMode, setIsHarvestMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (localStorage.getItem('theme') === 'dark') {
      return true;
    }
    if (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    return false;
  });

  const t = useCallback((key: any, options?: any) => {
    return translate(key, language, options);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Load cart from localStorage on initial load
  useEffect(() => {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (productId: number, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { productId, quantity }];
      }
    });
  };

  const updateCartItemQuantity = (productId: number, newQuantity: number) => {
    setCart(prevCart => {
        if (newQuantity <= 0) {
            return prevCart.filter(item => item.productId !== productId);
        }
        return prevCart.map(item =>
            item.productId === productId
                ? { ...item, quantity: newQuantity }
                : item
        );
    });
  };

  const removeCartItem = (productId: number) => {
      setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };


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
  
  const handleNavigateToSite = (siteId: number) => {
      setSelectedSiteId(siteId);
      setView(View.SITE_DETAILS);
  };

  const renderView = () => {
    if (!user) return null;

    const commonProps = { user, t, lang: language };

    switch (view) {
      case View.DASHBOARD:
        return <Dashboard {...commonProps} isHarvestMode={isHarvestMode} isDarkMode={isDarkMode} />;
      case View.SITE_MANAGEMENT:
        return <SiteManagement {...commonProps} onViewDetails={handleNavigateToSite} />;
      case View.SITE_DETAILS:
        if (!selectedSiteId) {
            setView(View.SITE_MANAGEMENT);
            return null;
        }
        return <SiteDetail siteId={selectedSiteId} onBack={() => setView(View.SITE_MANAGEMENT)} {...commonProps} />;
      case View.MARKETPLACE:
        return <Marketplace {...commonProps} addToCart={addToCart} />;
      case View.CART:
        return <CartView {...commonProps} cart={cart} updateCartItemQuantity={updateCartItemQuantity} removeCartItem={removeCartItem} setView={setView} />;
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
        return <Dashboard {...commonProps} isHarvestMode={isHarvestMode} isDarkMode={isDarkMode} />;
    }
  };

  if (loading) {
      return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900"><div className="text-xl font-semibold text-gray-700 dark:text-gray-300">{t('loading')}</div></div>;
  }

  if (!user) {
    return <AuthModal show={isAuthModalOpen} onLoginSuccess={handleLoginSuccess} onClose={() => setIsAuthModalOpen(false)} t={t} lang={language} />;
  }

  return (
    <div className={`flex h-screen text-gray-800 dark:text-gray-200 font-sans transition-colors duration-500 ${isHarvestMode ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-50 dark:bg-gray-900'}`}>
      <Sidebar currentView={view} setView={setView} userRole={user.role} t={t} lang={language} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            user={user} 
            onLogout={handleLogout} 
            t={t} 
            lang={language} 
            setLanguage={setLanguage} 
            cart={cart} 
            setView={setView} 
            isHarvestMode={isHarvestMode}
            setIsHarvestMode={setIsHarvestMode}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent">
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