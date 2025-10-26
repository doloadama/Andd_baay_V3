import React, { useState } from 'react';
import { User, Site, Project, Product, ProjectStatus, AvailabilityStatus } from '../types';
import { MOCK_SITES, MOCK_PROJECTS, MOCK_PRODUCTS, MALI_REGION_IMAGES } from '../constants';
import { t, Language } from '../utils/i18n';
import { ArrowLeft, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import ProjectEditModal from './NewProjectModal';

interface SiteDetailProps {
    siteId: number;
    user: User;
    t: (key: any, lang: Language, options?: any) => string;
    lang: Language;
    onBack: () => void;
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

const SiteDetail: React.FC<SiteDetailProps> = ({ siteId, user, t, lang, onBack }) => {
    const site = MOCK_SITES.find(s => s.id === siteId);
    
    const [siteProjects, setSiteProjects] = useState<Project[]>(MOCK_PROJECTS.filter(p => p.siteId === siteId));
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

    const handleOpenProjectModal = (project: Project | null = null) => {
        setProjectToEdit(project);
        setIsProjectModalOpen(true);
    };

    const handleCloseProjectModal = () => {
        setIsProjectModalOpen(false);
        setProjectToEdit(null);
    };

    const handleSaveProject = (projectData: Omit<Project, 'id'>, id: number | null) => {
        if (id) { // Editing
            const updatedProjects = siteProjects.map(p => p.id === id ? { ...p, ...projectData, id } : p);
            setSiteProjects(updatedProjects);
            const mockIndex = MOCK_PROJECTS.findIndex(p => p.id === id);
            if (mockIndex !== -1) MOCK_PROJECTS[mockIndex] = { ...MOCK_PROJECTS[mockIndex], ...projectData, id };
        } else { // Adding
            const newProject: Project = {
                id: Math.max(...MOCK_PROJECTS.map(p => p.id), 0) + 1,
                ...projectData
            };
            setSiteProjects(prev => [...prev, newProject]);
            MOCK_PROJECTS.push(newProject);
        }
        handleCloseProjectModal();
    };

    const handleDeleteProject = (projectId: number) => {
        if (window.confirm(t('confirmDeleteProject', lang))) {
            setSiteProjects(siteProjects.filter(p => p.id !== projectId));
            const mockIndex = MOCK_PROJECTS.findIndex(p => p.id === projectId);
            if (mockIndex !== -1) MOCK_PROJECTS.splice(mockIndex, 1);
        }
    };

    if (!site) {
        return (
            <div className="text-center">
                <p className="text-red-500">{t('siteNotFound', lang)}</p>
                <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    {t('backToSites', lang)}
                </button>
            </div>
        );
    }
    
    const projectIds = siteProjects.map(p => p.id);
    const products = MOCK_PRODUCTS.filter(p => projectIds.includes(p.projectId));
    
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
                        <button onClick={onBack} className="p-2 mr-4 rounded-full text-white hover:bg-white hover:bg-opacity-20 transition-colors" aria-label={t('backToSites', lang)}>
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
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('totalProjects', lang)}</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{siteProjects.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('activeProjects', lang)}</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{activeProjects.length}</p>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('totalExpectedYield', lang)}</h3>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalYield.toLocaleString()} kg</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{t('projectsOnSite', lang)}</h3>
                     <button onClick={() => handleOpenProjectModal()} className="flex items-center px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-green-700">
                        <PlusCircle size={18} className="mr-2" />
                        {t('addNewProject', lang)}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('projectName', lang)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('cropType', lang)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('endDate', lang)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('expectedYield', lang)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('status', lang)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions', lang)}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {siteProjects.map(project => (
                                <tr key={project.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{project.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{project.cropType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(project.endDate, lang)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{project.expectedYield.toLocaleString()} kg</td>
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">{t('productsFromSite', lang)}</h3>
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => (
                            <div key={product.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                                <img className="w-full h-40 object-cover" src={product.imageUrl} alt={product.productName} />
                                <div className="p-4">
                                    <h4 className="text-md font-bold text-gray-800 dark:text-gray-100">{product.productName}</h4>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(product.price)} / {product.unit}</p>
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.availabilityStatus, 'product')}`}>
                                            {product.availabilityStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-6">{t('noProductsFromSite', lang)}</p>
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
                />
            )}
        </div>
    );
};

export default SiteDetail;