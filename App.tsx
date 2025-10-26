import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import Analytics from './components/Analytics';
import Profile from './components/Profile';
import ImageStudio from './components/ImageEditor';
import Finance from './components/Finance';
import VoiceAssistant from './components/VoiceAssistant';
import AuthModal from './components/AuthModal';
import ChatBot from './components/ChatBot';
import { View, User, Project, Site, Product, Transaction, Investment, Role } from './types';
import { getProfile, logout } from './services/authService';
import { MOCK_PROJECTS, MOCK_SITES, MOCK_PRODUCTS, MOCK_TRANSACTIONS, MOCK_INVESTMENTS, USERS } from './constants';
import { Loader, Sprout } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Mock Data State ---
  const [sites, setSites] = useState<Site[]>(MOCK_SITES);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [investments, setInvestments] = useState<Investment[]>(MOCK_INVESTMENTS);

  const handleLoginSuccess = async () => {
    setIsAuthModalOpen(false);
    await fetchUserProfile();
  };

  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await getProfile();
      setCurrentUser(user);
      if (!user) {
        setCurrentView(View.MARKETPLACE); // Default to marketplace for guests
        setIsAuthModalOpen(true);
      } else if (user.role === Role.SELLER) {
        // If user is only a seller, default to marketplace instead of empty dashboard
        setCurrentView(View.MARKETPLACE);
      } else {
        setCurrentView(View.DASHBOARD);
      }
    } catch (e) {
      console.error("Error fetching profile", e)
      setCurrentUser(null);
      setIsAuthModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setCurrentView(View.MARKETPLACE);
    setIsAuthModalOpen(true);
  };
  
  const handleAddSite = (siteData: { name: string; location: string; }) => {
    if(!currentUser) return;
    const newSite: Site = {
      id: Math.max(0, ...sites.map(s => s.id)) + 1,
      farmerId: currentUser.id,
      ...siteData,
    };
    setSites(prev => [...prev, newSite]);
  };

  const handleAddProject = (project: Omit<Project, 'id'>) => {
      const newProject: Project = {
          id: Math.max(0, ...projects.map(p => p.id)) + 1,
          ...project
      };
      setProjects(prev => [...prev, newProject]);
  };
  
  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  }

  const handleAddProduct = (product: Omit<Product, 'id' | 'imageUrl'>, imageFile: File | null) => {
    const newProduct: Product = {
      id: Math.max(0, ...products.map(p => p.id)) + 1,
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : `https://source.unsplash.com/400x300/?${product.cropType}`,
      ...product
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const handleUpdateProduct = (updatedProduct: Product, imageFile: File | null) => {
    setProducts(prev => prev.map(p => {
      if (p.id === updatedProduct.id) {
        return {
          ...updatedProduct,
          imageUrl: imageFile ? URL.createObjectURL(imageFile) : updatedProduct.imageUrl,
        }
      }
      return p;
    }));
  };
  
  const RoleBasedGuard = ({ allowedRoles, children }: { allowedRoles: Role[], children: React.ReactNode}) => {
    if (currentUser && allowedRoles.includes(currentUser.role)) {
      return <>{children}</>;
    }
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">
        <h3 className="text-xl font-bold">Access Denied</h3>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const renderView = () => {
    if (!currentUser && currentView !== View.MARKETPLACE) {
      return (
        <div className="p-8 text-center text-gray-500">
            <h2 className="text-2xl font-semibold mb-2">Welcome to Andd Baay</h2>
            <p>Please log in to access your dashboard and other features.</p>
        </div>
      );
    }

    const userProjects = projects.filter(p => sites.some(s => s.id === p.siteId && s.farmerId === currentUser?.id));
    const userSites = sites.filter(s => s.farmerId === currentUser?.id);
    const userTransactions = transactions.filter(t => t.userId === currentUser?.id);
    const userInvestments = investments.filter(i => i.farmerId === currentUser?.id);
    
    switch (currentView) {
      case View.DASHBOARD:
        return <RoleBasedGuard allowedRoles={[Role.FARMER, Role.BOTH]}><Dashboard 
          currentUser={currentUser!}
          projects={userProjects}
          sites={userSites}
          products={products}
          onAddProject={handleAddProject}
          onUpdateProject={handleUpdateProject}
          onAddSite={handleAddSite}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          allProducts={products}
          investments={userInvestments}
          transactions={userTransactions}
        /></RoleBasedGuard>;
      case View.MARKETPLACE:
        return <Marketplace 
          allProducts={products}
          userProjects={userProjects}
          currentUser={currentUser}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          allUsers={USERS}
        />;
      case View.ANALYTICS:
        return <RoleBasedGuard allowedRoles={[Role.FARMER, Role.SELLER, Role.BOTH]}><Analytics 
          projects={userProjects} 
          products={products}
          transactions={userTransactions} 
        /></RoleBasedGuard>;
      case View.FINANCE:
        return <RoleBasedGuard allowedRoles={[Role.FARMER, Role.SELLER, Role.BOTH]}><Finance 
          transactions={userTransactions}
          investments={userInvestments}
          setTransactions={setTransactions}
          setInvestments={setInvestments}
          currentUser={currentUser!}
        /></RoleBasedGuard>;
      case View.PROFILE:
        return <RoleBasedGuard allowedRoles={[Role.FARMER, Role.SELLER, Role.BOTH]}><Profile 
            currentUser={currentUser!} 
            onUpdateUser={setCurrentUser}
            sites={userSites}
            projects={userProjects}
            onAddSite={handleAddSite}
        /></RoleBasedGuard>;
      case View.IMAGE_STUDIO:
        return <RoleBasedGuard allowedRoles={[Role.FARMER, Role.BOTH]}><ImageStudio /></RoleBasedGuard>;
      case View.VOICE_ASSISTANT:
        return <RoleBasedGuard allowedRoles={[Role.FARMER, Role.SELLER, Role.BOTH]}><VoiceAssistant /></RoleBasedGuard>;
      default:
        return <Marketplace allProducts={products} userProjects={userProjects} currentUser={currentUser} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} allUsers={USERS} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-stone-50 text-emerald-800">
        <Sprout size={64} className="mb-4" />
        <Loader className="animate-spin" size={32} />
        <p className="mt-4 text-lg font-semibold">Loading Andd Baay...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-stone-100 font-sans">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentUser={currentUser} 
          view={currentView} 
          onLogout={handleLogout} 
          onSetView={setCurrentView}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8 md:px-10 md:py-10">
            {renderView()}
          </div>
        </main>
      </div>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      {currentUser && <ChatBot currentUser={currentUser} />}
    </div>
  );
};

export default App;