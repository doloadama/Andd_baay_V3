import React, { useState, useMemo } from 'react';
// Fix: Add Investment and Site types
import { User, Transaction, ExpenseCategory, Site, Project, Investment } from '../types';
import { Language } from '../utils/i18n';
import { formatCurrency, formatDate } from '../utils/formatters';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Edit, Trash2, FileText } from 'lucide-react';
import TransactionModal from './TransactionModal';
import ReportModal from './ReportModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface FinanceProps {
    user: User;
    t: (key: any, options?: any) => string;
    lang: Language;
    isDarkMode: boolean;
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    investments: Investment[];
    setInvestments: React.Dispatch<React.SetStateAction<Investment[]>>;
    sites: Site[];
    projects: Project[];
}

const PIE_CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const Finance: React.FC<FinanceProps> = ({ user, t, lang, isDarkMode, transactions, setTransactions, sites, projects }) => {
    const [filterSiteId, setFilterSiteId] = useState<string>(''); // '' for All
    const [filterProjectId, setFilterProjectId] = useState<string>(''); // '' for All

    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);
    const [reportTitle, setReportTitle] = useState('');
    const [reportContent, setReportContent] = useState<React.ReactNode>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const userSites = useMemo(() => sites.filter(s => s.farmerId === user.id), [user.id, sites]);
    
    const projectsForSelectedSite = useMemo(() => {
        if (!filterSiteId) return [];
        return projects.filter(p => p.siteId === parseInt(filterSiteId, 10));
    }, [filterSiteId, projects]);

    const filteredTransactions = useMemo(() => {
        let filtered = transactions.filter(tx => tx.userId === user.id);
        if (!filterSiteId) {
            return filtered;
        }
        filtered = filtered.filter(tx => tx.siteId === parseInt(filterSiteId, 10));
        if (filterProjectId) {
            filtered = filtered.filter(tx => tx.projectId === parseInt(filterProjectId, 10));
        }
        return filtered;
    }, [transactions, filterSiteId, filterProjectId, user.id]);


    const { totalIncome, totalExpenses, netBalance } = useMemo(() => {
        const totalIncome = filteredTransactions
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);
        const totalExpenses = filteredTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);
        return {
            totalIncome,
            totalExpenses,
            netBalance: totalIncome - totalExpenses,
        };
    }, [filteredTransactions]);

    const expenseByCategoryData = useMemo(() => {
        const categoryMap = new Map<string, number>();
        filteredTransactions
            .filter(tx => tx.type === 'expense' && tx.category)
            .forEach(tx => {
                const category = tx.category!;
                const currentAmount = categoryMap.get(category) || 0;
                categoryMap.set(category, currentAmount + tx.amount);
            });
        
        return Array.from(categoryMap.entries()).map(([name, value]) => ({
            name: t(name),
            value,
        }));
    }, [filteredTransactions, t]);

    const financialChartData = useMemo(() => {
        const data: { name: string; income: number; expense: number }[] = [];
        const today = new Date();
        
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = d.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: '2-digit' });
            data.push({ name: monthKey, income: 0, expense: 0 });
        }
        
        filteredTransactions.forEach(tx => {
            const txDate = new Date(tx.date);
            const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);
            if (txDate >= twelveMonthsAgo) {
                const monthKey = txDate.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: '2-digit' });
                const monthData = data.find(d => d.name === monthKey);
                if (monthData) {
                    if (tx.type === 'income') monthData.income += tx.amount;
                    else monthData.expense += tx.amount;
                }
            }
        });

        return data;
    }, [filteredTransactions, lang]);

    const handleOpenTransactionModal = (transaction: Transaction | null = null) => {
        setTransactionToEdit(transaction);
        setIsTransactionModalOpen(true);
    };

    const handleSaveTransaction = (data: Omit<Transaction, 'id' | 'userId'>, id: number | null) => {
        if (id) { // Editing
             const updatedTransactions = transactions.map(tx => tx.id === id ? { ...tx, ...data, id, userId: user.id } : tx);
             setTransactions(updatedTransactions);
        } else { // Adding
            const newTransaction: Transaction = {
                id: Math.max(...transactions.map(tx => tx.id), 0) + 1,
                userId: user.id,
                ...data,
            };
            setTransactions(prev => [newTransaction, ...prev]);
        }
        setIsTransactionModalOpen(false);
        setTransactionToEdit(null);
    };
    
    const handleDeleteTransaction = (id: number) => {
        if (window.confirm(t('confirmDeleteTransaction'))) {
            setTransactions(prev => prev.filter(tx => tx.id !== id));
        }
    };
    
    const handleGenerateMonthlyReport = () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const monthTransactions = filteredTransactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getFullYear() === year && txDate.getMonth() + 1 === month;
        });

        const income = monthTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
        const expenses = monthTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
        
        const monthName = new Date(year, month - 1, 1).toLocaleString(lang, { month: 'long', year: 'numeric' });
        setReportTitle(t('monthlyReportFor', { month: monthName }));
        
        setReportData(monthTransactions.map(tx => ({
            Date: tx.date,
            Description: tx.description,
            Type: tx.type,
            Category: tx.category || 'N/A',
            Amount: tx.amount,
        })));
        
        setReportContent(
            <div className="text-sm">
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div><span className="font-semibold block">{t('income')}</span> {formatCurrency(income)}</div>
                    <div><span className="font-semibold block">{t('expense')}</span> {formatCurrency(expenses)}</div>
                    <div><span className="font-semibold block">{t('netBalance')}</span> {formatCurrency(income - expenses)}</div>
                </div>
                <ul className="space-y-2">
                    {monthTransactions.map(tx => <li key={tx.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"><span>{tx.description}</span><span className={tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{formatCurrency(tx.amount)}</span></li>)}
                </ul>
            </div>
        );
        setIsReportModalOpen(true);
    };


    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">{t('navFinance')}</h2>

             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8">
                <div className="flex flex-wrap items-center gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('filterBySite')}</label>
                        <select 
                            value={filterSiteId} 
                            onChange={e => { setFilterSiteId(e.target.value); setFilterProjectId(''); }}
                            className="mt-1 block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="">{t('allSites')}</option>
                            {userSites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('filterByProject')}</label>
                         <select 
                            value={filterProjectId} 
                            onChange={e => setFilterProjectId(e.target.value)} 
                            disabled={!filterSiteId}
                            className="mt-1 block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-200 dark:disabled:bg-gray-600"
                        >
                            <option value="">{t('allProjects')}</option>
                            {projectsForSelectedSite.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-start">
                    <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full mr-4"><TrendingUp className="text-green-600 dark:text-green-400" /></div>
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('income')}</h3>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(totalIncome)}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-start">
                    <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full mr-4"><TrendingDown className="text-red-600 dark:text-red-400" /></div>
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('expense')}</h3>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(totalExpenses)}</p>
                    </div>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full mr-4"><DollarSign className="text-blue-600 dark:text-blue-400" /></div>
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('netBalance')}</h3>
                        <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(netBalance)}</p>
                    </div>
                </div>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('financialTrends')}</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={financialChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4A5568' : '#E2E8F0'}/>
                                <XAxis dataKey="name" stroke={isDarkMode ? '#A0AEC0' : '#4A5568'} />
                                <YAxis tickFormatter={(value: number) => `$${(value / 1000)}k`} stroke={isDarkMode ? '#A0AEC0' : '#4A5568'} />
                                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#2D3748' : '#FFFFFF', border: `1px solid ${isDarkMode ? '#4A5568' : '#E2E8F0'}` }} />
                                <Legend wrapperStyle={{ color: isDarkMode ? '#FFFFFF' : '#000000' }} />
                                <Line type="monotone" dataKey="income" name={t('income')} stroke="#10B981" strokeWidth={2} />
                                <Line type="monotone" dataKey="expense" name={t('expense')} stroke="#EF4444" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('expenseBreakdown')}</h3>
                    <div style={{ width: '100%', height: 300 }}>
                         <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={expenseByCategoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => (typeof percent === 'number' && percent > 0.03 ? `${name} ${(percent * 100).toFixed(0)}%` : '')}
                                >
                                    {expenseByCategoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('financialReports')}</h3>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <input 
                            type="month" 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200"
                        />
                        <button onClick={handleGenerateMonthlyReport} className="flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-700">
                            <FileText size={16} className="mr-2"/>
                            {t('generateMonthlyReport')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{t('allTransactions')}</h3>
                    <button onClick={() => handleOpenTransactionModal()} className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700">
                        <PlusCircle size={18} className="mr-2" />
                        {t('addTransaction')}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                         <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('description')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('amount')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('type')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('category')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('date')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('relatedSite')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('relatedProject')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredTransactions.map(tx => {
                                const site = sites.find(s => s.id === tx.siteId);
                                const project = projects.find(p => p.id === tx.projectId);
                                return (
                                <tr key={tx.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{tx.description}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(tx.amount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{t(tx.type)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{tx.category ? t(tx.category) : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(tx.date, lang)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{site?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{project?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                        <button onClick={() => handleOpenTransactionModal(tx)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"><Edit size={18} /></button>
                                        <button onClick={() => handleDeleteTransaction(tx.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                     {filteredTransactions.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('noTransactions')}</p>}
                </div>
            </div>

            {isTransactionModalOpen && (
                <TransactionModal
                    isOpen={isTransactionModalOpen}
                    onClose={() => setIsTransactionModalOpen(false)}
                    onSave={handleSaveTransaction}
                    transaction={transactionToEdit}
                    userId={user.id}
                    t={t}
                    lang={lang}
                    // Fix: Pass missing userSites and projects props to TransactionModal
                    userSites={userSites}
                    projects={projects}
                />
            )}
            {isReportModalOpen && (
                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    title={reportTitle}
                    csvData={reportData}
                    csvFilename={`${reportTitle.replace(/\s+/g, '_').toLowerCase()}_report.csv`}
                    t={t}
                    lang={lang}
                >
                    {reportContent}
                </ReportModal>
            )}
        </div>
    );
};

export default Finance;