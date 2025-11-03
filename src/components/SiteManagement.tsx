import React, { useState } from 'react';
import { User, Site, Project, ProjectStatus } from '../types';
import { Language } from '../utils/i18n';
import SiteEditModal from './SiteEditModal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import * as siteService from '../services/siteService';

interface SiteManagementProps {
    user: User;
    t: (key: any, options?: any) => string;
    lang: Language;
    onViewDetails: (siteId: number) => void;
    sites: Site[];
    setSites: React.Dispatch<React.SetStateAction<Site[]>>;
    projects: Project[];
}

const SiteManagement: React.FC<SiteManagementProps> = ({ user, t, onViewDetails, sites, setSites, projects }) => {
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

    const handleSaveSite = async (siteData: Omit<Site, 'id' | 'farmerId'>, id: number | null) => {
        try {
            if (id) {
                const updatedSite = await siteService.updateSite(id, siteData);
                setSites(sites.map(s => (s.id === id ? updatedSite : s)));
            } else {
                const newSite = await siteService.createSite(siteData);
                setSites([newSite, ...sites]);
            }
            handleCloseModal();
        } catch (err) {
            alert('Failed to save site.');
        }
    };
    
    const handleDeleteSite = async (siteId: number) => {
        if (window.confirm(t('confirmDeleteSite'))) {
            try {
                await siteService.deleteSite(siteId);
                setSites(sites.filter(s => s.id !== siteId));
            } catch (err) {
                alert('Failed to delete site.');
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
                <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">{t('navSiteManagement')}</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    {t('addNewSite')}
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
                                    <p><span className="font-semibold">{t('activeProjectsCount')}:</span> {stats.activeProjectsCount}</p>
                                    <p><span className="font-semibold">{t('totalExpectedYield')}:</span> {stats.totalYield.toLocaleString()} kg</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 flex justify-end items-center space-x-2 rounded-b-lg">
                                <button onClick={() => onViewDetails(site.id)} className="text-sm px-4 py-2 font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">{t('viewDetails')}</button>
                                <button onClick={() => handleOpenModal(site)} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><Edit size={18} /></button>
                                <button onClick={() => handleDeleteSite(site.id)} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {sites.length === 0 && (
                <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-lg shadow-md">
                     <p className="text-gray-500 dark:text-gray-400">{t('noSitesFound')}</p>
                </div>
            )}

            {isModalOpen && (
                <SiteEditModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveSite}
                    site={siteToEdit}
                    t={t}
                />
            )}
        </div>
    );
};

export default SiteManagement;
