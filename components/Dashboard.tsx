import React, { useState, useMemo } from 'react';
import { User, Project, ProjectStatus, Product, Transaction } from '../types';
import { MOCK_PROJECTS, MOCK_PRODUCTS, MOCK_TRANSACTIONS } from '../constants';
import { formatCurrency, formatDate } from '../utils/formatters';
import { t, Language } from '../utils/i18n';
import ProjectEditModal from './NewProjectModal';
import ProductListingModal from './ProductListingModal';
import { PlusCircle, Edit, Trash2, CheckSquare, ListPlus, TrendingUp, TrendingDown, DollarSign, Briefcase } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


interface DashboardProps {
    user: User;
    t: (key: any, lang: Language, options?: any) => string;
    lang: Language;
    isHarvestMode: boolean;
    isDarkMode: boolean;
}

const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case ProjectStatus.COMPLETED: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case ProjectStatus.HARVESTING: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case ProjectStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case ProjectStatus.PLANNING: return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
}

const Dashboard: React.FC<DashboardProps> = ({ user, t, lang, isHarvestMode, isDarkMode }) => {
    const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

    // State for Harvest Mode's Product Listing Modal
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [projectForListing, setProjectForListing] = useState<Project | null>(null);

    const userTransactions = useMemo(() => MOCK_TRANSACTIONS.filter(t => t.userId === user.id), [user.id]);
    const totalIncome = useMemo(() => userTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), [userTransactions]);
    const totalExpenses = useMemo(() => userTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [userTransactions]);
    const netProfit = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);
    
    const financialChartData = useMemo(() => {
        const data: { name: string; income: number; expense: number }[] = [];
        const today = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = d.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: '2-digit' });
            data.push({ name: monthKey, income: 0, expense: 0 });
        }
        
        userTransactions.forEach(tx => {
            const txDate = new Date(tx.date);
            const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
            if (txDate >= sixMonthsAgo) {
                const monthKey = txDate.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: '2-digit' });
                const monthData = data.find(d => d.name === monthKey);
                if (monthData) {
                    if (tx.type === 'income') monthData.income += tx.amount;
                    else monthData.expense += tx.amount;
                }
            }
        });

        return data;
    }, [userTransactions, lang]);

    const displayedProjects = projects.slice(0, 5);

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
            const updatedProjects = projects.map(p => p.id === id ? { ...p, ...projectData, id } : p);
            setProjects(updatedProjects);
            const mockIndex = MOCK_PROJECTS.findIndex(p => p.id === id);
            if (mockIndex !== -1) MOCK_PROJECTS[mockIndex] = { ...MOCK_PROJECTS[mockIndex], ...projectData, id };
        } else { // Adding
            const newProject: Project = {
                id: Math.max(...MOCK_PROJECTS.map(p => p.id), 0) + 1,
                ...projectData
            };
            setProjects(prev => [newProject, ...prev]);
            MOCK_PROJECTS.unshift(newProject);
        }
        handleCloseProjectModal();
    };

    const handleDeleteProject = (projectId: number) => {
        if (window.confirm(t('confirmDeleteProject', lang))) {
            setProjects(projects.filter(p => p.id !== projectId));
            const mockIndex = MOCK_PROJECTS.findIndex(p => p.id === projectId);
            if (mockIndex !== -1) MOCK_PROJECTS.splice(mockIndex, 1);
        }
    };
    
    // --- Harvest Mode Specific Functions ---

    const handleAddProduct = (newProduct: Omit<Product, 'id' | 'farmerId'>) => {
        const productToAdd: Product = {
            id: Math.max(...MOCK_PRODUCTS.map(p => p.id), 0) + 1,
            farmerId: user.id,
            ...newProduct
        };
        MOCK_PRODUCTS.unshift(productToAdd);
        setIsProductModalOpen(false);
        setProjectForListing(null);
    };
    
    const handleMarkComplete = (projectId: number) => {
        const updatedProjects = projects.map(p => 
            p.id === projectId ? { ...p, status: ProjectStatus.COMPLETED } : p
        );
        setProjects(updatedProjects);
        const mockIndex = MOCK_PROJECTS.findIndex(p => p.id === projectId);
        if (mockIndex !== -1) {
            MOCK_PROJECTS[mockIndex].status = ProjectStatus.COMPLETED;
        }
    };

    const handleOpenProductModal = (project: Project) => {
        setProjectForListing(project);
        setIsProductModalOpen(true);
    };

    if (isHarvestMode) {
        const harvestingProjects = projects.filter(p => p.status === ProjectStatus.HARVESTING);

        return (
            <div>
                 <h2 className="text-3xl font-semibold text-amber-800 dark:text-amber-300 mb-6">{t('projectsReadyForHarvest', lang)}</h2>
                 {harvestingProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {harvestingProjects.map(project => (
                            <div key={project.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-amber-500 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{project.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">{project.cropType}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('expectedYield', lang)}: <span className="font-semibold">{project.expectedYield.toLocaleString()} kg</span></p>
                                </div>
                                <div className="mt-4 border-t dark:border-gray-700 pt-4 flex flex-col space-y-2">
                                    <button onClick={() => handleOpenProjectModal(project)} className="w-full flex items-center justify-center text-sm px-3 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-semibold rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"><TrendingUp size={16} className="mr-2"/> {t('updateYield', lang)}</button>
                                    <button onClick={() => handleOpenProductModal(project)} className="w-full flex items-center justify-center text-sm px-3 py-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 font-semibold rounded-lg hover:bg-green-200 dark:hover:bg-green-800"><ListPlus size={16} className="mr-2"/> {t('listProductFromHarvest', lang)}</button>
                                    <button onClick={() => handleMarkComplete(project.id)} className="w-full flex items-center justify-center text-sm px-3 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"><CheckSquare size={16} className="mr-2"/> {t('markAsComplete', lang)}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                 ) : (
                    <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-lg shadow-md">
                        <p className="text-gray-500 dark:text-gray-400">{t('noHarvestingProjects', lang)}</p>
                    </div>
                 )}
                 {isProductModalOpen && projectForListing && (
                    <ProductListingModal
                        isOpen={isProductModalOpen}
                        onClose={() => setIsProductModalOpen(false)}
                        onSubmit={handleAddProduct}
                        user={user}
                        projectForListing={projectForListing}
                        t={t}
                        lang={lang}
                    />
                 )}
                 {isProjectModalOpen && (
                    <ProjectEditModal
                        isOpen={isProjectModalOpen}
                        onClose={handleCloseProjectModal}
                        onSave={handleSaveProject}
                        project={projectToEdit}
                        userId={user.id}
                        t={t}
                        lang={lang}
                    />
                )}
            </div>
        );
    }


    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">{t('welcomeBack', lang, { name: user.name.split(' ')[0] })}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
                     <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full mr-4"><Briefcase className="text-blue-600 dark:text-blue-400" /></div>
                     <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('activeProjects', lang)}</h3>
                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{projects.filter(p => p.status !== ProjectStatus.COMPLETED).length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
                    <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full mr-4"><TrendingUp className="text-green-600 dark:text-green-400" /></div>
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('totalRevenue', lang)}</h3>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
                    <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full mr-4"><TrendingDown className="text-red-600 dark:text-red-400" /></div>
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('totalExpenses', lang)}</h3>
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
                     <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full mr-4"><DollarSign className="text-indigo-600 dark:text-indigo-400" /></div>
                     <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('netProfit', lang)}</h3>
                        <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-gray-800 dark:text-gray-100' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(netProfit)}</p>
                    </div>
                </div>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('revenueVsExpenses', lang)}</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={financialChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4A5568' : '#E2E8F0'}/>
                                <XAxis dataKey="name" stroke={isDarkMode ? '#A0AEC0' : '#4A5568'} />
                                <YAxis tickFormatter={(value: number) => `$${(value / 1000)}k`} stroke={isDarkMode ? '#A0AEC0' : '#4A5568'} />
                                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#2D3748' : '#FFFFFF', border: `1px solid ${isDarkMode ? '#4A5568' : '#E2E8F0'}` }} />
                                <Legend wrapperStyle={{ color: isDarkMode ? '#FFFFFF' : '#000000' }} />
                                <Line type="monotone" dataKey="income" stroke="#10B981" name={t('income', lang)} strokeWidth={2} />
                                <Line type="monotone" dataKey="expense" stroke="#EF4444" name={t('expense', lang)} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('recentTransactions', lang)}</h3>
                    <div className="space-y-4 overflow-y-auto h-80 pr-2">
                        {userTransactions.slice(0, 5).map(tx => (
                            <div key={tx.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{tx.description}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(tx.date, lang)}</p>
                                </div>
                                <p className={`font-semibold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{t('yourRecentProjects', lang)}</h3>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('status', lang)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions', lang)}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {displayedProjects.map(project => (
                                <tr key={project.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{project.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{project.cropType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(project.endDate, lang)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
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

            {isProjectModalOpen && (
                <ProjectEditModal
                    isOpen={isProjectModalOpen}
                    onClose={handleCloseProjectModal}
                    onSave={handleSaveProject}
                    project={projectToEdit}
                    userId={user.id}
                    t={t}
                    lang={lang}
                />
            )}
        </div>
    );
}

export default Dashboard;