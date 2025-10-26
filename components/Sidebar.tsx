import React from 'react';
import { View, User, Role } from '../types';
import { LayoutDashboard, Store, BarChart3, UserCircle, Image, DollarSign, Mic, LogIn, Sprout } from 'lucide-react';

interface SidebarProps {
    currentView: View;
    setView: (view: View) => void;
    currentUser: User | null;
    onOpenAuthModal: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, currentUser, onOpenAuthModal }) => {
    
    const navItems = [
        { view: View.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard', roles: [Role.FARMER, Role.BOTH] },
        { view: View.MARKETPLACE, icon: Store, label: 'Marketplace', roles: [Role.FARMER, Role.SELLER, Role.BOTH] },
        { view: View.ANALYTICS, icon: BarChart3, label: 'Analytics', roles: [Role.FARMER, Role.SELLER, Role.BOTH] },
        { view: View.FINANCE, icon: DollarSign, label: 'Finance', roles: [Role.FARMER, Role.SELLER, Role.BOTH] },
        { view: View.IMAGE_STUDIO, icon: Image, label: 'Image Studio', roles: [Role.FARMER, Role.BOTH] },
        { view: View.VOICE_ASSISTANT, icon: Mic, label: 'Voice Assistant', roles: [Role.FARMER, Role.SELLER, Role.BOTH] },
    ];
    
    const availableNavItems = currentUser ? navItems.filter(item => item.roles.includes(currentUser.role)) : [];
    const publicNavItems = navItems.filter(item => item.view === View.MARKETPLACE);

    const NavItem = ({ item, isActive, onClick }: any) => (
         <button
            onClick={onClick}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                    ? 'bg-emerald-100 text-emerald-800 shadow-sm' 
                    : 'text-gray-600 hover:bg-stone-100 hover:text-gray-900'
            }`}
        >
            <item.icon size={20} />
            <span>{item.label}</span>
        </button>
    );

    return (
        <aside className="w-64 bg-white border-r border-stone-200 flex flex-col shrink-0">
            <div className="relative overflow-hidden group text-center bg-emerald-800">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 transition-transform duration-500 ease-in-out group-hover:scale-110"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1624555130581-33462c39e9a1?q=80&w=800&auto=format&fit=crop')" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/50 to-emerald-950/80"></div>
                <div className="relative flex flex-col items-center justify-center h-28">
                    <div className="flex items-center space-x-3">
                         <Sprout className="text-white transition-transform duration-500 group-hover:rotate-12" size={28} />
                         <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                            Andd Baay
                        </h1>
                    </div>
                </div>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
                {currentUser ? availableNavItems.map(item => (
                    <NavItem 
                        key={item.view}
                        item={item}
                        isActive={currentView === item.view}
                        onClick={() => setView(item.view)}
                    />
                )) : publicNavItems.map(item => (
                    <NavItem 
                        key={item.view}
                        item={item}
                        isActive={currentView === item.view}
                        onClick={() => setView(item.view)}
                    />
                ))}
            </nav>
            
            <div className="p-4">
              {!currentUser && (
                  <button onClick={onOpenAuthModal} className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm">
                      <LogIn size={18} />
                      <span>Login / Register</span>
                  </button>
              )}
            </div>
        </aside>
    );
};

export default Sidebar;