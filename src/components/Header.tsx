import React from 'react';
import { User, CartItem, View } from '../types';
// Fix: Update t function prop and usage to align with App.tsx
import { Language } from '../utils/i18n';
import { ShoppingCart, Wheat, Sun, Moon } from 'lucide-react';

interface HeaderProps {
    user: User;
    onLogout: () => void;
    t: (key: any, options?: any) => string;
    lang: Language;
    setLanguage: (lang: Language) => void;
    cart: CartItem[];
    setView: (view: View) => void;
    isHarvestMode: boolean;
    setIsHarvestMode: (value: boolean) => void;
    isDarkMode: boolean;
    setIsDarkMode: (value: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, t, lang, setLanguage, cart, setView, isHarvestMode, setIsHarvestMode, isDarkMode, setIsDarkMode }) => {
    const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    return (
        <header className={`flex items-center justify-between p-4 border-b transition-colors duration-500 ${isHarvestMode ? 'bg-amber-500 border-amber-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm'}`}>
            <h1 className={`text-xl font-semibold ${isHarvestMode ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{t('appName')}</h1>
            <div className="flex items-center space-x-4">
                 <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${isHarvestMode ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{t('harvestMode')}</span>
                    <button
                        onClick={() => setIsHarvestMode(!isHarvestMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isHarvestMode ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isHarvestMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        <Wheat size={14} className={`absolute text-yellow-400 transition-opacity ${isHarvestMode ? 'opacity-100 left-1.5' : 'opacity-0'}`} />
                    </button>
                 </div>
                 <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-2 rounded-full transition-colors ${isHarvestMode ? 'text-white hover:bg-amber-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    aria-label={t('toggleTheme')}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                 <div>
                    <select
                        value={lang}
                        onChange={(e) => setLanguage(e.target.value as Language)}
                        className={`p-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${isHarvestMode ? 'bg-amber-600 text-white border-amber-700' : 'border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white'}`}
                    >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                    </select>
                </div>
                 <button
                    onClick={() => setView(View.CART)}
                    className={`relative cursor-pointer p-2 rounded-full ${isHarvestMode ? 'hover:bg-amber-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    aria-label={t('viewCart')}
                >
                    <ShoppingCart className={isHarvestMode ? 'text-white' : 'text-gray-600 dark:text-gray-300'} />
                    {totalCartItems > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {totalCartItems}
                        </span>
                    )}
                </button>
                <div className="text-right">
                    <p className={`font-semibold ${isHarvestMode ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>{user.name}</p>
                    <p className={`text-sm capitalize ${isHarvestMode ? 'text-amber-100' : 'text-gray-500 dark:text-gray-400'}`}>{t(user.role.toLowerCase() as any)}</p>
                </div>
                <button
                    onClick={onLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150"
                >
                    {t('logout')}
                </button>
            </div>
        </header>
    );
}

export default Header;