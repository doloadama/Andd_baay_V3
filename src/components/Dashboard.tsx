import React, { useState, useMemo, useEffect } from 'react';
// Fix: Add Site to imports
import { User, Project, ProjectStatus, Product, Transaction, Site } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Language } from '../utils/i18n';
import ProjectEditModal from './NewProjectModal';
import ProductListingModal from './ProductListingModal';
import { PlusCircle, Edit, Trash2, CheckSquare, ListPlus, TrendingUp, TrendingDown, DollarSign, Briefcase, ArrowUpRight, ArrowDownLeft, ArrowUpCircle, ArrowDownCircle, MoreVertical } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


interface DashboardProps {
    user: User;
    t: (key: any, options?: any) => string;
    lang: Language;
    isHarvestMode: boolean;
    isDarkMode: boolean;
    projects: Project[];
    transactions: Transaction[];
    products: Product[];
    sites: Site[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case ProjectStatus.COMPLETED: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300';
        case ProjectStatus.HARVESTING: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300';
        case ProjectStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300';
        case ProjectStatus.PLANNING: return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-400';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-400';
    }
}

const StatCard = ({ title, value, icon: Icon, trend, trendColor }: { title: string, value: string, icon: React.ElementType, trend?: string, trendColor?: string }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">{title}</h3>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</p>
                 {trend && (
                    <div className={`flex items-center text-xs mt-2 ${trendColor}`}>
                        {trend.startsWith('+') ? <ArrowUpRight size={14} className="mr-1"/> : <ArrowDownLeft size={14} className="mr-1"/>}
                        {trend}
                    </div>
                )}
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                <Icon className="text-gray-600 dark:text-gray-300" size={24} />
            </div>
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ user, t, lang, isHarvestMode, isDarkMode, projects, transactions, products, sites, setProjects, setProducts }) => {
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

    // State for Harvest Mode's Product Listing Modal
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [projectForListing, setProjectForListing] = useState<Project | null>(null);
    const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);

    useEffect(() => {
        const handleClose = () => setOpenActionMenu(null);
        if (openActionMenu !== null) {
            window.addEventListener('click', handleClose);
        }
        return () => {
            window.removeEventListener('click', handleClose);
        };
    }, [openActionMenu]);

    const userTransactions = useMemo(() => transactions.filter(tx => tx.userId === user.id), [user.id, transactions]);
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
        } else { // Adding
            const newProject: Project = {
                id: Math.max(...projects.map(p => p.id), 0) + 1,
                ...projectData
            };
            setProjects(prev => [newProject, ...prev]);
        }
        handleCloseProjectModal();
    };

    const handleDeleteProject = (projectId: number) => {
        if (window.confirm(t('confirmDeleteProject'))) {
            setProjects(projects.filter(p => p.id !== projectId));
        }
    };
    
    // --- Harvest Mode Specific Functions ---

    const handleAddProduct = (newProduct: Omit<Product, 'id' | 'farmerId'>) => {
        const productToAdd: Product = {
            id: Math.max(...products.map(p => p.id), 0) + 1,
            farmerId: user.id,
            ...newProduct
        };
        setProducts(prev => [productToAdd, ...prev]);
        setIsProductModalOpen(false);
        setProjectForListing(null);
    };
    
    const handleMarkComplete = (projectId: number) => {
        const updatedProjects = projects.map(p => 
            p.id === projectId ? { ...p, status: ProjectStatus.COMPLETED } : p
        );
        setProjects(updatedProjects);
    };

    const handleOpenProductModal = (project: Project) => {
        setProjectForListing(project);
        setIsProductModalOpen(true);
    };

    if (isHarvestMode) {
        const harvestingProjects = projects.filter(p => p.status === ProjectStatus.HARVESTING);

        return (
            <div className="space-y-8">
                 <h2 className="text-3xl font-bold text-amber-800 dark:text-amber-300">{t('projectsReadyForHarvest')}</h2>
                 {harvestingProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {harvestingProjects.map(project => (
                            <div key={project.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-l-4 border-amber-500 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{project.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">{project.cropType}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('expectedYield')}: <span className="font-semibold">{project.expectedYield.toLocaleString()} kg</span></p>
                                </div>
                                <div className="mt-6 border-t dark:border-gray-700 pt-4 flex flex-col space-y-2">
                                    <button onClick={() => handleOpenProductModal(project)} className="w-full flex items-center justify-center text-sm px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"><ListPlus size={16} className="mr-2"/> {t('listProductFromHarvest')}</button>
                                    <button onClick={() => handleOpenProjectModal(project)} className="w-full flex items-center justify-center text-sm px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"><TrendingUp size={16} className="mr-2"/> {t('updateYield')}</button>
                                    <button onClick={() => handleMarkComplete(project.id)} className="w-full flex items-center justify-center text-sm px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"><CheckSquare size={16} className="mr-2"/> {t('markAsComplete')}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                 ) : (
                    <div className="text-center bg-white dark:bg-gray-800 p-12 rounded-xl shadow-md">
                        <p className="text-lg text-gray-500 dark:text-gray-400">{t('noHarvestingProjects')}</p>
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
                        userProjects={projects.filter(p => sites.some(s => s.id === p.siteId && s.farmerId === user.id))}
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
                        sites={sites}
                    />
                )}
            </div>
        );
    }


    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('welcomeBack', { name: user.name.split(' ')[0] })}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('activeProjects')} value={projects.filter(p => p.status !== ProjectStatus.COMPLETED).length.toString()} icon={Briefcase} trend="+2 this week" trendColor="text-blue-500" />
                <StatCard title={t('totalRevenue')} value={formatCurrency(totalIncome)} icon={TrendingUp} trend="+10.2%" trendColor="text-green-500"/>
                <StatCard title={t('totalExpenses')} value={formatCurrency(totalExpenses)} icon={TrendingDown} trend="+5.1%" trendColor="text-red-500"/>
                <StatCard title={t('netProfit')} value={formatCurrency(netProfit)} icon={DollarSign} trend="-1.5%" trendColor="text-red-500"/>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('revenueVsExpenses')}</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={financialChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'}/>
                                <XAxis dataKey="name" stroke={isDarkMode ? '#A0AEC0' : '#4A5568'} fontSize={12}/>
                                <YAxis tickFormatter={(value: number) => `$${(value / 1000)}k`} stroke={isDarkMode ? '#A0AEC0' : '#4A5568'} fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`, borderRadius: '0.5rem' }} />
                                <Legend wrapperStyle={{ color: isDarkMode ? '#FFFFFF' : '#000000' }} />
                                <Area type="monotone" dataKey="income" stroke="#10B981" fillOpacity={1} fill="url(#colorIncome)" name={t('income')} strokeWidth={2} />
                                <Area type="monotone" dataKey="expense" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpense)" name={t('expense')} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('recentTransactions')}</h3>
                    <div className="space-y-3 overflow-y-auto h-80 pr-2 -mr-2">
                        {userTransactions.slice(0, 10).map(tx => (
                            <div key={tx.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                                    {tx.type === 'income' ? 
                                        <ArrowUpCircle className="text-green-600 dark:text-green-400" size={20}/> : 
                                        <ArrowDownCircle className="text-red-600 dark:text-red-400" size={20}/>}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{tx.description}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(tx.date, lang)}</p>
                                </div>
                                <p className={`font-semibold text-sm ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{t('yourRecentProjects')}</h3>
                    <button onClick={() => handleOpenProjectModal()} className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors">
                        <PlusCircle size={18} className="mr-2" />
                        {t('addNewProject')}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('projectName')}</th>
                                <th scope="col" className="px-6 py-3">{t('cropType')}</th>
                                <th scope="col" className="px-6 py-3">{t('endDate')}</th>
                                <th scope="col" className="px-6 py-3">{t('status')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedProjects.map(project => (
                                <tr key={project.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{project.name}</td>
                                    <td className="px-6 py-4">{project.cropType}</td>
                                    <td className="px-6 py-4">{formatDate(project.endDate, lang)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(project.status)}`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => setOpenActionMenu(openActionMenu === project.id ? null : project.id)}
                                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <MoreVertical size={20} />
                                            </button>
                                            {openActionMenu === project.id && (
                                                <div
                                                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
                                                >
                                                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                                        <button
                                                            onClick={() => { handleOpenProjectModal(project); setOpenActionMenu(null); }}
                                                            className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            <Edit size={16} className="mr-3" />
                                                            {t('edit')}
                                                        </button>
                                                        {project.status !== ProjectStatus.COMPLETED && (
                                                            <button
                                                                onClick={() => { handleMarkComplete(project.id); setOpenActionMenu(null); }}
                                                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            >
                                                                <CheckSquare size={16} className="mr-3" />
                                                                {t('markAsComplete')}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => { handleDeleteProject(project.id); setOpenActionMenu(null); }}
                                                            className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            <Trash2 size={16} className="mr-3" />
                                                            {t('delete')}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
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
                    sites={sites}
                />
            )}
        </div>
    );
}

export default Dashboard;