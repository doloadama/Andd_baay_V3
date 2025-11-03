import React, { useState, useMemo } from 'react';
import { User, Site, Project, Product, ProjectStatus, AvailabilityStatus } from '../types';
import { MALI_REGION_IMAGES } from '../constants';
import { Language } from '../utils/i18n';
import { ArrowLeft, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import ProjectEditModal from './NewProjectModal';
import * as projectService from '../services/projectService';

interface SiteDetailProps {
    siteId: number;
    user: User;
    t: (key: any, options?: any) => string;
    lang: Language;
    onBack: () => void;
    sites: Site[];
    allProjects: Project[];
    allProducts: Product[];
    setAllProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

const getStatusColor = (status: ProjectStatus | AvailabilityStatus, type: 'project' | 'product') => {
    if (type === 'project') {
        switch (status) {
            case ProjectStatus.COMPLETED: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case ProjectStatus.HARVESTING: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case ProjectStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case ProjectStatus.PLANNING: return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    } else {
         switch (status) {
            case AvailabilityStatus.AVAILABLE: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case AvailabilityStatus.OUT_OF_STOCK: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case AvailabilityStatus.PRE_ORDER: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    }
};

const getProgressDetails = (status: ProjectStatus) => {
    switch (status) {
        case ProjectStatus.PLANNING:
            return { percentage: 10, color: 'bg-gray-400' };
        case ProjectStatus.IN_PROGRESS:
            return { percentage: 50, color: 'bg-blue-500' };
        case ProjectStatus.HARVESTING:
            return { percentage: 80, color: 'bg-yellow-500' };
        case ProjectStatus.COMPLETED:
            return { percentage: 100, color: 'bg-green-500' };
        default:
            return { percentage: 0, color: 'bg-gray-400' };
    }
};


const SiteDetail: React.FC<SiteDetailProps> = ({ siteId, user, t, lang, onBack, sites, allProjects, allProducts, setAllProjects }) => {
    const site = sites.find(s => s.id === siteId);
    
    const siteProjects = useMemo(() => allProjects.filter(p => p.siteId === siteId), [allProjects, siteId]);
    
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

    const productivityStats = useMemo(() => {
        const completedProjects = siteProjects.filter(p => p.status === ProjectStatus.COMPLETED);
        if (completedProjects.length === 0) {
            return {
                totalCompletedYield: 0,
                averageDuration: 0,
            };
        }

        const totalCompletedYield = completedProjects.reduce((sum, p) => sum + p.expectedYield, 0);

        const totalDuration = completedProjects.reduce((sum, p) => {
            const startDate = new Date(p.startDate).getTime();
            const endDate = new Date(p.endDate).getTime();
            if (isNaN(startDate) || isNaN(endDate)) return sum;
            const duration = (endDate - startDate) / (1000 * 60 * 60 * 24);
            return sum + duration;
        }, 0);

        const averageDuration = totalDuration / completedProjects.length;

        return {
            totalCompletedYield,
            averageDuration: Math.round(averageDuration),
        };

    }, [siteProjects]);

    const handleOpenProjectModal = (project: Project | null = null) => {
        setProjectToEdit(project);
        setIsProjectModalOpen(true);
    };

    const handleCloseProjectModal = () => {
        setIsProjectModalOpen(false);
        setProjectToEdit(null);
    };

    const handleSaveProject = async (projectData: Omit<Project, 'id'>, id: number | null) => {
        if (id) {
            const updatedProject = await projectService.updateProject(id, projectData);
            setAllProjects(allProjects.map(p => p.id === id ? updatedProject : p));
        } else {
            const newProject = await projectService.createProject(projectData);
            setAllProjects([newProject, ...allProjects]);
        }
        handleCloseProjectModal();
    };

    const handleDeleteProject = async (projectId: number) => {
        if (window.confirm(t('confirmDeleteProject'))) {
            await projectService.deleteProject(projectId);
            setAllProjects(allProjects.filter(p => p.id !== projectId));
        }
    };

    if (!site) {
        return (
            <div className="text-center">
                <p className="text-red-500">{t('siteNotFound')}</p>
                <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    {t('backToSites')}
                </button>
            </div>
        );
    }
    
    const projectIds = siteProjects.map(p => p.id);
    const products = allProducts.filter(p => projectIds.includes(p.projectId));
    
    const activeProjects = siteProjects.filter(p => p.status !== ProjectStatus.COMPLETED);
    const totalYield = siteProjects.reduce((sum, p) => sum + p.expectedYield, 0);
    const backgroundImageUrl = MALI_REGION_IMAGES[site.location] || 'https://source.unsplash.com/1600x900/?mali,landscape';


    return (
        <div>
            <div className="relative rounded-lg shadow-lg -mx-6 -mt-8 mb-8 p-6 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center filter blur-sm"
                    style={{ backgroundImage: `url(${backgroundImageUrl})` }}
                ></div>
                <div className="absolute inset-0 bg-black opacity-60"></div>
                <div className="relative z-10">
                    <div className="flex items-center">
                        <button onClick={onBack} className="p-2 mr-4 rounded-full text-white hover:bg-white hover:bg-opacity-20 transition-colors" aria-label={t('backToSites')}>
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 className="text-3xl font-semibold text-white">{site.name}</h2>
                            <p className="text-gray-300">{site.location}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('totalProjects')}</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{siteProjects.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('activeProjects')}</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{activeProjects.length}</p>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('totalExpectedYield')}</h3>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalYield.toLocaleString()} kg</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('siteProductivitySummary')}</h3>
                {productivityStats.averageDuration > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('completedProjectsYield')}</h4>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{productivityStats.totalCompletedYield.toLocaleString()} kg</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('avgProjectDuration')}</h4>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{productivityStats.averageDuration} {t('days')}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('noCompletedProjects')}</p>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{t('projectsOnSite')}</h3>
                     <button onClick={() => handleOpenProjectModal()} className="flex items-center px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-green-700">
                        <PlusCircle size={18} className="mr-2" />
                        {t('addNewProject')}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('projectName')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('cropType')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('endDate')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('progress')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('status')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {siteProjects.map(project => {
                                const progress = getProgressDetails(project.status);
                                return (
                                <tr key={project.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{project.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{project.cropType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(project.endDate, lang)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <div className="w-24 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                                <div 
                                                    className={`${progress.color} h-2.5 rounded-full`} 
                                                    style={{ width: `${progress.percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="ml-3 font-medium text-gray-700 dark:text-gray-300">{progress.percentage}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status, 'project')}`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                        <button onClick={() => handleOpenProjectModal(project)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"><Edit size={18} /></button>
                                        <button onClick={() => handleDeleteProject(project.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">{t('productsFromSite')}</h3>
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => {
                            const project = siteProjects.find(p => p.id === product.projectId);
                            return (
                                <div key={product.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                                    <img className="w-full h-40 object-cover" src={product.imageUrl} alt={product.productName} />
                                    <div className="p-4">
                                        <h4 className="text-md font-bold text-gray-800 dark:text-gray-100">{product.productName}</h4>
                                        {project && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {t('fromProject')}: <span className="font-medium text-gray-600 dark:text-gray-300">{project.name}</span>
                                            </p>
                                        )}
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(product.price)} / {product.unit}</p>
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.availabilityStatus, 'product')}`}>
                                                {product.availabilityStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-6">{t('noProductsFromSite')}</p>
                )}
            </div>

            {isProjectModalOpen && (
                 <ProjectEditModal
                    isOpen={isProjectModalOpen}
                    onClose={handleCloseProjectModal}
                    onSave={handleSaveProject}
                    project={projectToEdit}
                    userId={user.id}
                    siteId={site.id}
                    t={t}
                    lang={lang}
                    sites={sites}
                />
            )}
        </div>
    );
};

export default SiteDetail;