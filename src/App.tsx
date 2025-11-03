import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import Analytics from './components/Analytics';
import Profile from './components/Profile';
import Finance from './components/Finance';
import AuthModal from './components/AuthModal';
import SiteManagement from './components/SiteManagement';
import SiteDetail from './components/SiteDetail';
import CartView from './components/CartView';
import ImageEditor from './components/ImageEditor';
import VoiceAssistant from './components/VoiceAssistant';
import { View, User, CartItem, Site, Project, Product, Transaction, Investment } from './types';
import * as authService from './services/authService';
import * as siteService from './services/siteService';
import * as projectService from './services/projectService';
import * as productService from './services/productService';
import * as financeService from './services/financeService';
import * as analyticsService from './services/analyticsService';

import ChatBot from './components/ChatBot';
import { t as translate, Language } from './utils/i18n';
import { Loader } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [language, setLanguage] = useState<Language>((localStorage.getItem('language') as Language) || 'en');
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHarvestMode, setIsHarvestMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (localStorage.getItem('theme') === 'dark') return true;
    if (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
    return false;
  });

  // Centralized data state
  const [sites, setSites] = useState<Site[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

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

  useEffect(() => {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
  }, [cart]);

  const fetchAllData = async () => {
      if (!user) return;
      setDataLoading(true);
      try {
        const [sitesData, projectsData, productsData, transactionsData, investmentsData, analyticsSummary] = await Promise.all([
          siteService.getSites(),
          projectService.getProjects(),
          productService.getProducts(),
          financeService.getTransactions(),
          financeService.getInvestments(),
          analyticsService.getAnalyticsSummary(),
        ]);
        setSites(sitesData);
        setProjects(projectsData);
        setProducts(productsData);
        setTransactions(transactionsData);
        setInvestments(investmentsData);
        setAnalyticsData(analyticsSummary);
      } catch (error) {
        console.error("Failed to fetch app data", error);
        // Handle error display to user
      } finally {
        setDataLoading(false);
      }
  };

  useEffect(() => {
      if(user) {
        fetchAllData();
      }
  }, [user]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await authService.getProfile();
        setUser(currentUser); // It's ok if it's null, we'll show the modal
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setAppLoading(false);
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
    setSites([]);
    setProjects([]);
    setProducts([]);
    setTransactions([]);
    setInvestments([]);
  };

  const addToCart = (productId: number, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { productId, quantity }];
    });
  };

  const updateCartItemQuantity = (productId: number, newQuantity: number) => {
    setCart(prevCart => {
      if (newQuantity <= 0) return prevCart.filter(item => item.productId !== productId);
      return prevCart.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const removeCartItem = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const handleProfileUpdate = (updatedUser: User) => setUser(updatedUser);
  const handleNavigateToSite = (siteId: number) => {
    setSelectedSiteId(siteId);
    setView(View.SITE_DETAILS);
  };

  const renderView = () => {
    if (!user) return null;

    const commonProps = { user, t, lang: language };

    if (dataLoading) {
        return <div className="flex items-center justify-center h-full"><Loader className="animate-spin" size={48} /></div>;
    }

    switch (view) {
      // Fix: Pass `products` and `sites` to Dashboard to remove mock data dependency.
      case View.DASHBOARD:
        return <Dashboard {...commonProps} isHarvestMode={isHarvestMode} isDarkMode={isDarkMode} projects={projects} transactions={transactions} setProjects={setProjects} products={products} setProducts={setProducts} sites={sites} />;
      case View.SITE_MANAGEMENT:
        return <SiteManagement {...commonProps} onViewDetails={handleNavigateToSite} sites={sites} setSites={setSites} projects={projects} />;
      // Fix: Pass `sites`, `allProjects`, `allProducts`, and `setAllProjects` to SiteDetail.
      case View.SITE_DETAILS:
        if (!selectedSiteId) { setView(View.SITE_MANAGEMENT); return null; }
        return <SiteDetail siteId={selectedSiteId} onBack={() => setView(View.SITE_MANAGEMENT)} {...commonProps} sites={sites} allProjects={projects} allProducts={products} setAllProjects={setProjects} />;
      // Fix: Pass `products`, `setProducts`, and `userProjects` to Marketplace.
      case View.MARKETPLACE:
        return <Marketplace {...commonProps} addToCart={addToCart} products={products} setProducts={setProducts} userProjects={projects.filter(p => sites.some(s => s.id === p.siteId && s.farmerId === user.id))} />;
      // Fix: Pass `products` to CartView.
      case View.CART:
        return <CartView {...commonProps} cart={cart} updateCartItemQuantity={updateCartItemQuantity} removeCartItem={removeCartItem} setView={setView} products={products} />;
      // Fix: Pass `analyticsData` to Analytics.
      case View.ANALYTICS:
        return <Analytics {...commonProps} isDarkMode={isDarkMode} analyticsData={analyticsData} />;
      // Fix: Pass all finance-related state to Finance component.
      case View.FINANCE:
        return <Finance {...commonProps} isDarkMode={isDarkMode} transactions={transactions} setTransactions={setTransactions} investments={investments} setInvestments={setInvestments} sites={sites} projects={projects} />;
      // Fix: Pass all necessary data slices to Profile component.
      case View.PROFILE:
        return <Profile {...commonProps} onProfileUpdate={handleProfileUpdate} sites={sites} projects={projects} products={products} transactions={transactions} />;
      case View.IMAGE_STUDIO:
        return <ImageEditor {...commonProps} />;
      case View.VOICE_ASSISTANT:
        return <VoiceAssistant {...commonProps} />;
      // Fix: Pass `products` and `sites` to Dashboard to remove mock data dependency.
      default:
        return <Dashboard {...commonProps} isHarvestMode={isHarvestMode} isDarkMode={isDarkMode} projects={projects} transactions={transactions} setProjects={setProjects} products={products} setProducts={setProducts} sites={sites} />;
    }
  };

  if (appLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900"><div className="text-xl font-semibold text-gray-700 dark:text-gray-300">{t('loading')}</div></div>;
  }

  if (!user) {
    return <AuthModal show={!user} onLoginSuccess={handleLoginSuccess} onClose={() => {}} t={t} lang={language} />;
  }

  return (
    <div className={`flex h-screen text-gray-800 dark:text-gray-200 font-sans transition-colors duration-500 ${isHarvestMode ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-50 dark:bg-gray-900'}`}>
      <Sidebar currentView={view} setView={setView} userRole={user.role} t={t} />
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