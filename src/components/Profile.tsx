import React, { useState, useMemo } from 'react';
// Fix: Add Site to imports
import { User, Role, Project, Product, Transaction, ProjectStatus, Site } from '../types';
import * as authService from '../services/authService';
import { Language } from '../utils/i18n';
import { User as UserIcon, MapPin, Phone, Edit, Briefcase, Sprout, Package, FileText, PlusCircle } from 'lucide-react';
import ProfileEditModal from './ProfileEditModal';

interface ProfileProps {
    user: User;
    onProfileUpdate: (updatedUser: User) => void;
    t: (key: any, options?: any) => string;
    lang: Language;
    sites: Site[];
    projects: Project[];
    products: Product[];
    transactions: Transaction[];
}

const formatDateRelative = (dateString: string, t: (key: any, options?: any) => string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return t('yearsAgo', { count: Math.floor(interval) });
    interval = seconds / 2592000;
    if (interval > 1) return t('monthsAgo', { count: Math.floor(interval) });
    interval = seconds / 86400;
    if (interval > 1) return t('daysAgo', { count: Math.floor(interval) });
    interval = seconds / 3600;
    if (interval > 1) return t('hoursAgo', { count: Math.floor(interval) });
    interval = seconds / 60;
    if (interval > 1) return t('minutesAgo', { count: Math.floor(interval) });
    return t('justNow');
};

const Profile: React.FC<ProfileProps> = ({ user, onProfileUpdate, t, lang, sites, projects, products, transactions }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [message, setMessage] = useState('');

    const stats = useMemo(() => {
        const userSites = sites.filter(s => s.farmerId === user.id);
        const userProjects = projects.filter(p => userSites.some(s => s.id === p.siteId));
        const userProducts = products.filter(p => p.farmerId === user.id);
        
        return {
            sites: userSites.length,
            activeProjects: userProjects.filter(p => p.status !== ProjectStatus.COMPLETED).length,
            productsListed: userProducts.length,
        };
    }, [user.id, sites, projects, products]);
    
    const recentActivity = useMemo(() => {
        const projectActivities: any[] = projects.filter(p => sites.some(s => s.id === p.siteId && s.farmerId === user.id))
            .map(p => ({
                type: 'project',
                date: p.startDate,
                text: t('activityCreatedProject', { name: p.name }),
                icon: Briefcase,
            }));
        
        const productActivities: any[] = products.filter(p => p.farmerId === user.id)
            .map(p => ({
                type: 'product',
                date: new Date().toISOString(), // Mock date as products don't have one
                text: t('activityListedProduct', { name: p.productName }),
                icon: Package,
            }));

        const transactionActivities: any[] = transactions.filter(tx => tx.userId === user.id)
            .map(tx => ({
                type: 'transaction',
                date: tx.date,
                text: t('activityAddedTransaction', { desc: tx.description }),
                icon: tx.type === 'income' ? PlusCircle : FileText,
            }));

        return [...projectActivities, ...productActivities, ...transactionActivities]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }, [user.id, t, projects, sites, products, transactions]);

    const handleProfileUpdate = async (updatedData: User) => {
        setMessage(t('updating'));
        const updatedUser = await authService.updateProfile(updatedData);
        if (updatedUser) {
            onProfileUpdate(updatedUser);
            setIsEditModalOpen(false);
            setMessage(t('profileUpdateSuccess'));
        } else {
            setMessage(t('profileUpdateFailed'));
        }
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">{t('navProfile')}</h2>
            {message && <div className="mb-4 text-center p-3 rounded-md bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">{message}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <UserIcon className="w-12 h-12 text-gray-500 dark:text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 capitalize">{t(user.role.toLowerCase() as any)}</p>
                        <div className="text-left mt-6 space-y-3 text-sm">
                            <p className="flex items-center text-gray-600 dark:text-gray-300">
                                <MapPin size={16} className="mr-3 text-gray-400" /> {user.location}
                            </p>
                            <p className="flex items-center text-gray-600 dark:text-gray-300">
                                <Phone size={16} className="mr-3 text-gray-400" /> {user.phone}
                            </p>
                        </div>
                        <button onClick={() => setIsEditModalOpen(true)} className="mt-6 w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                           <Edit size={16} className="mr-2" /> {t('editProfile')}
                        </button>
                    </div>
                </div>

                {/* Right Column: Stats & Activity */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('statistics')}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(user.role === Role.FARMER || user.role === Role.BOTH) && (
                                <>
                                    <StatCard icon={Briefcase} title={t('farmSites')} value={stats.sites} />
                                    <StatCard icon={Sprout} title={t('activeProjects')} value={stats.activeProjects} />
                                </>
                            )}
                             {(user.role === Role.SELLER || user.role === Role.BOTH) && (
                                <StatCard icon={Package} title={t('productsListed')} value={stats.productsListed} />
                             )}
                        </div>
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('recentActivity')}</h4>
                        <ul className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <li key={index} className="flex items-start">
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 mr-4">
                                        <activity.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-800 dark:text-gray-100">{activity.text}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateRelative(activity.date, t)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {isEditModalOpen && (
                <ProfileEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleProfileUpdate}
                    user={user}
                    t={t}
                    lang={lang}
                />
            )}
        </div>
    );
};

const StatCard = ({ icon: Icon, title, value }: { icon: React.ElementType, title: string, value: number | string }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md flex items-center">
        <div className="bg-gray-200 dark:bg-gray-600 p-3 rounded-full mr-4">
            <Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        </div>
    </div>
);


export default Profile;