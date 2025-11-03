import React, { useState } from 'react';
import { User, Site, Project, ProjectStatus } from '../types';
import { t, Language } from '../utils/i18n';
import SiteEditModal from './AddSiteForm';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
// Fix: Removed service import and added mock data imports to make component self-contained.
import { MOCK_SITES, MOCK_PROJECTS } from '../constants';


interface SiteManagementProps {
    user: User;
    t: (key: any, lang: Language, options?: any) => string;
    lang: Language;
    onViewDetails: (siteId: number) => void;
    // Fix: Removed props that were causing errors in App.tsx as this component will manage its own state.
    // sites: Site[];
    // setSites: React.Dispatch<React.SetStateAction<Site[]>>;
    // projects: Project[];
}

const SiteManagement: React.FC<SiteManagementProps> = ({ user, t, lang, onViewDetails }) => {
    // Fix: Added local state for sites and projects, initialized from mock data.
    const [sites, setSites] = useState<Site[]>(MOCK_SITES.filter(s => s.farmerId === user.id));
    const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [siteToEdit, setSiteToEdit] = useState<Site | null>(null);

    const handleOpenModal = (site: Site | null = null) => {
        setSiteToEdit(site);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSiteToEdit(null);
    };

    const handleSaveSite = (siteData: Omit<Site, 'id' | 'farmerId'>, id: number | null) => {
        if (id) { // Editing
            const updatedSite = { ...sites.find(s => s.id === id)!, ...siteData, id, farmerId: user.id };
            setSites(sites.map(s => s.id === id ? updatedSite : s));
            const mockIndex = MOCK_SITES.findIndex(s => s.id === id);
            if (mockIndex > -1) {
                MOCK_SITES[mockIndex] = updatedSite;
            }
        } else { // Adding
            const newSite: Site = {
                id: Math.max(...MOCK_SITES.map(s => s.id), 0) + 1,
                farmerId: user.id,
                ...siteData
            };
            setSites([newSite, ...sites]);
            MOCK_SITES.push(newSite);
        }
        handleCloseModal();
    };
    
    const handleDeleteSite = (siteId: number) => {
        if (window.confirm(t('confirmDeleteSite', lang))) {
            setSites(sites.filter(s => s.id !== siteId));
            const mockIndex = MOCK_SITES.findIndex(s => s.id === siteId);
            if (mockIndex > -1) {
                MOCK_SITES.splice(mockIndex, 1);
            }
        }
    };
    
    const getSiteStats = (siteId: number) => {
        const projectsForSite = projects.filter(p => p.siteId === siteId);
        const activeProjects = projectsForSite.filter(p => p.status !== ProjectStatus.COMPLETED);
        const totalYield = activeProjects.reduce((sum, p) => sum + p.expectedYield, 0);
        return {
            activeProjectsCount: activeProjects.length,
            totalYield: totalYield,
        };
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">{t('navSiteManagement', lang)}</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    {t('addNewSite', lang)}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sites.map(site => {
                    const stats = getSiteStats(site.id);
                    return (
                        <div key={site.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                            <div className="p-6 flex-grow">
                                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate">{site.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{site.location}</p>
                                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                    <p><span className="font-semibold">{t('activeProjectsCount', lang)}:</span> {stats.activeProjectsCount}</p>
                                    <p><span className="font-semibold">{t('totalExpectedYield', lang)}:</span> {stats.totalYield.toLocaleString()} kg</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 flex justify-end items-center space-x-2 rounded-b-lg">
                                <button onClick={() => onViewDetails(site.id)} className="text-sm px-4 py-2 font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">{t('viewDetails', lang)}</button>
                                <button onClick={() => handleOpenModal(site)} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><Edit size={18} /></button>
                                <button onClick={() => handleDeleteSite(site.id)} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {sites.length === 0 && (
                <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-lg shadow-md">
                     <p className="text-gray-500 dark:text-gray-400">{t('noSitesFound', lang)}</p>
                </div>
            )}

            {isModalOpen && (
                <SiteEditModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveSite}
                    site={siteToEdit}
                    t={t}
                    lang={lang}
                />
            )}
        </div>
    );
};

export default SiteManagement;