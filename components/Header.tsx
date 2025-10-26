import React, { useState, useRef, useEffect } from 'react';
import { User, View } from '../types';
import { Bell, ChevronDown, UserCircle, LogOut } from 'lucide-react';

interface HeaderProps {
    currentUser: User | null;
    view: View;
    onLogout: () => void;
    onSetView: (view: View) => void;
}

const viewTitles: Record<View, string> = {
    [View.DASHBOARD]: 'Dashboard',
    [View.MARKETPLACE]: 'Marketplace',
    [View.ANALYTICS]: 'Analytics',
    [View.PROFILE]: 'My Profile',
    [View.IMAGE_STUDIO]: 'Image Studio',
    [View.FINANCE]: 'Finance Hub',
    [View.VOICE_ASSISTANT]: 'Voice Assistant',
};

const Header: React.FC<HeaderProps> = ({ currentUser, view, onLogout, onSetView }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white border-b border-stone-200 p-4 sm:p-6 flex justify-between items-center z-20 sticky top-0 shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{viewTitles[view] || 'Andd Baay'}</h1>
            {currentUser && (
                <div className="flex items-center space-x-4 md:space-x-6">
                    <button className="text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-stone-100">
                        <Bell size={22} />
                    </button>
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-3 cursor-pointer group p-1 rounded-lg hover:bg-stone-100 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                                {currentUser.name.charAt(0)}
                            </div>
                            <div className='hidden md:block text-left'>
                                <p className="font-semibold text-sm text-gray-800">{currentUser.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{currentUser.role.toLowerCase()}</p>
                            </div>
                            <ChevronDown size={18} className={`text-gray-500 group-hover:text-gray-800 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <div 
                            className={`absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 ease-out z-30
                                ${isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`
                            }
                        >
                            <div className="py-1">
                                <div className="px-4 py-3 border-b border-stone-200">
                                    <p className="text-sm font-semibold text-gray-900">Signed in as</p>
                                    <p className="text-sm text-gray-600 truncate">{currentUser.email}</p>
                                </div>
                                <button
                                    onClick={() => { onSetView(View.PROFILE); setIsDropdownOpen(false); }}
                                    className="w-full text-left flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-stone-100 hover:text-gray-900 transition-colors"
                                >
                                    <UserCircle size={18} />
                                    <span>My Profile</span>
                                </button>
                                <button
                                    onClick={() => { onLogout(); setIsDropdownOpen(false); }}
                                    className="w-full text-left flex items-center space-x-3 px-4 py-3 text-sm text-red-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;