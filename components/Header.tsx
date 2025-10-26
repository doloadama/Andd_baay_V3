import React from 'react';
import { User } from '../types';
import { t, Language } from '../utils/i18n';

interface HeaderProps {
    user: User;
    onLogout: () => void;
    t: (key: any, lang: Language) => string;
    lang: Language;
    setLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, t, lang, setLanguage }) => {
    return (
        <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
            <h1 className="text-xl font-semibold text-gray-800">{t('appName', lang)}</h1>
            <div className="flex items-center space-x-4">
                 <div>
                    <select
                        value={lang}
                        onChange={(e) => setLanguage(e.target.value as Language)}
                        className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                    </select>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-gray-700">{user.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{t(user.role.toLowerCase() as any, lang)}</p>
                </div>
                <button
                    onClick={onLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150"
                >
                    {t('logout', lang)}
                </button>
            </div>
        </header>
    );
}

export default Header;
