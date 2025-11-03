import React from 'react';
import { View, Role } from '../types';
import { LayoutDashboard, Store, BarChart2, Landmark, User as UserIcon, Building } from 'lucide-react';
import { t, Language } from '../utils/i18n';

interface SidebarProps {
    currentView: View;
    setView: (view: View) => void;
    userRole: Role;
    t: (key: any, lang: Language, options?: any) => string;
    lang: Language;
}

const NavItem = ({ icon: Icon, label, isActive, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 rounded-lg ${
      isActive
        ? 'bg-green-600 text-white shadow-md'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    <Icon className="w-5 h-5 mr-3" />
    <span className="font-medium">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, userRole, t, lang }) => {
    const isFarmer = userRole === Role.FARMER || userRole === Role.BOTH;
    const isSeller = userRole === Role.SELLER || userRole === Role.BOTH;

    const navItems = [
        { view: View.DASHBOARD, label: t('navDashboard', lang), icon: LayoutDashboard, roles: [Role.FARMER, Role.BOTH] },
        { view: View.SITE_MANAGEMENT, label: t('navSiteManagement', lang), icon: Building, roles: [Role.FARMER, Role.BOTH] },
        { view: View.MARKETPLACE, label: t('navMarketplace', lang), icon: Store, roles: [Role.FARMER, Role.SELLER, Role.BOTH] },
        { view: View.ANALYTICS, label: t('navAnalytics', lang), icon: BarChart2, roles: [Role.FARMER, Role.SELLER, Role.BOTH] },
        { view: View.FINANCE, label: t('navFinance', lang), icon: Landmark, roles: [Role.FARMER, Role.SELLER, Role.BOTH] },
        { view: View.PROFILE, label: t('navProfile', lang), icon: UserIcon, roles: [Role.FARMER, Role.BOTH] },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col p-4">
            <div className="text-2xl font-bold text-green-700 dark:text-green-500 mb-8 px-2">
                Andd Baay
            </div>
            <nav className="flex-1 space-y-2">
                {navItems.map(item =>
                    item.roles.includes(userRole) && (
                        <NavItem
                            key={item.view}
                            icon={item.icon}
                            label={item.label}
                            isActive={currentView === item.view}
                            onClick={() => setView(item.view)}
                        />
                    )
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;