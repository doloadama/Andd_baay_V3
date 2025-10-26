import React, { useState, useMemo } from 'react';
import { User, Investment, Transaction } from '../types';
import { MOCK_INVESTMENTS, MOCK_TRANSACTIONS, MOCK_PROJECTS } from '../constants';
import { t, Language } from '../utils/i18n';
import { formatCurrency, formatDate } from '../utils/formatters';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Edit, Trash2, FileText } from 'lucide-react';
import InvestmentModal from './InvestmentModal';
import TransactionModal from './TransactionModal';
import ReportModal from './ReportModal';

interface FinanceProps {
    user: User;
    t: (key: any, lang: Language, options?: any) => string;
    lang: Language;
}

const Finance: React.FC<FinanceProps> = ({ user, t, lang }) => {
    const [investments, setInvestments] = useState<Investment[]>(MOCK_INVESTMENTS.filter(i => i.farmerId === user.id));
    const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS.filter(tx => tx.userId === user.id));

    const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    
    const [investmentToEdit, setInvestmentToEdit] = useState<Investment | null>(null);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    
    // State for Reports
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);
    const [reportTitle, setReportTitle] = useState('');
    const [reportContent, setReportContent] = useState<React.ReactNode>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));


    const { totalIncome, totalExpenses, netBalance, totalInvestments } = useMemo(() => {
        const totalIncome = transactions
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);
        const totalExpenses = transactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);
        const totalInvestments = investments.reduce((sum, inv) => sum + inv.amount, 0);
        return {
            totalIncome,
            totalExpenses,
            netBalance: totalIncome - totalExpenses,
            totalInvestments,
        };
    }, [transactions, investments]);

    const handleOpenInvestmentModal = (investment: Investment | null = null) => {
        setInvestmentToEdit(investment);
        setIsInvestmentModalOpen(true);
    };

    const handleOpenTransactionModal = (transaction: Transaction | null = null) => {
        setTransactionToEdit(transaction);
        setIsTransactionModalOpen(true);
    };

    const handleSaveInvestment = (data: Omit<Investment, 'id' | 'farmerId'>, id: number | null) => {
        if (id) { // Editing
            const updatedInvestments = investments.map(i => i.id === id ? { ...i, ...data, id, farmerId: user.id } : i);
            setInvestments(updatedInvestments);
        } else { // Adding
            const newInvestment: Investment = {
                id: Math.max(...MOCK_INVESTMENTS.map(i => i.id), 0) + 1,
                farmerId: user.id,
                ...data,
            };
            MOCK_INVESTMENTS.unshift(newInvestment);
            setInvestments(prev => [newInvestment, ...prev]);
        }
        setIsInvestmentModalOpen(false);
        setInvestmentToEdit(null);
    };

    const handleSaveTransaction = (data: Omit<Transaction, 'id' | 'userId'>, id: number | null) => {
        if (id) { // Editing
             const updatedTransactions = transactions.map(tx => tx.id === id ? { ...tx, ...data, id, userId: user.id } : tx);
             setTransactions(updatedTransactions);
        } else { // Adding
            const newTransaction: Transaction = {
                id: Math.max(...MOCK_TRANSACTIONS.map(tx => tx.id), 0) + 1,
                userId: user.id,
                ...data,
            };
            MOCK_TRANSACTIONS.unshift(newTransaction);
            setTransactions(prev => [newTransaction, ...prev]);
        }
        setIsTransactionModalOpen(false);
        setTransactionToEdit(null);
    };
    
    const handleDeleteInvestment = (id: number) => {
        if (window.confirm(t('confirmDeleteInvestment', lang))) {
            setInvestments(prev => prev.filter(i => i.id !== id));
        }
    };
    
    const handleDeleteTransaction = (id: number) => {
        if (window.confirm(t('confirmDeleteTransaction', lang))) {
            setTransactions(prev => prev.filter(tx => tx.id !== id));
        }
    };
    
    const handleGenerateMonthlyReport = () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const monthTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getFullYear() === year && txDate.getMonth() + 1 === month;
        });

        const income = monthTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
        const expenses = monthTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
        
        const monthName = new Date(year, month - 1, 1).toLocaleString(lang, { month: 'long', year: 'numeric' });
        setReportTitle(t('monthlyReportFor', lang, { month: monthName }));
        
        setReportData(monthTransactions.map(tx => ({
            Date: tx.date,
            Description: tx.description,
            Type: tx.type,
            Amount: tx.amount,
        })));
        
        setReportContent(
            <div className="text-sm">
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div><span className="font-semibold block">{t('income', lang)}</span> {formatCurrency(income)}</div>
                    <div><span className="font-semibold block">{t('expense', lang)}</span> {formatCurrency(expenses)}</div>
                    <div><span className="font-semibold block">{t('netBalance', lang)}</span> {formatCurrency(income - expenses)}</div>
                </div>
                <ul className="space-y-2">
                    {monthTransactions.map(tx => <li key={tx.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"><span>{tx.description}</span><span className={tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{formatCurrency(tx.amount)}</span></li>)}
                </ul>
            </div>
        );
        setIsReportModalOpen(true);
    };

    const handleGenerateInvestmentReport = () => {
        setReportTitle(t('investmentPortfolio', lang));
        setReportData(investments.map(inv => ({
            Name: inv.name,
            Amount: inv.amount,
            Date: inv.date,
            Description: inv.description,
            Project: MOCK_PROJECTS.find(p => p.id === inv.relatedProjectId)?.name || 'N/A',
        })));
        setReportContent(
             <div className="text-sm">
                 <div className="mb-4 text-center"><span className="font-semibold">{t('totalInvested', lang)}:</span> {formatCurrency(totalInvestments)}</div>
                <ul className="space-y-2">
                    {investments.map(inv => <li key={inv.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"><span>{inv.name}</span><span className="font-semibold">{formatCurrency(inv.amount)}</span></li>)}
                </ul>
            </div>
        );
        setIsReportModalOpen(true);
    };


    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">{t('navFinance', lang)}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-start">
                    <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full mr-4"><TrendingUp className="text-green-600 dark:text-green-400" /></div>
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('income', lang)}</h3>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(totalIncome)}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-start">
                    <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full mr-4"><TrendingDown className="text-red-600 dark:text-red-400" /></div>
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('expense', lang)}</h3>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(totalExpenses)}</p>
                    </div>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full mr-4"><DollarSign className="text-blue-600 dark:text-blue-400" /></div>
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('netBalance', lang)}</h3>
                        <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(netBalance)}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-start">
                    <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-full mr-4"><DollarSign className="text-yellow-600 dark:text-yellow-400" /></div>
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('totalInvestments', lang)}</h3>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(totalInvestments)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('financialReports', lang)}</h3>
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
                            {t('generateMonthlyReport', lang)}
                        </button>
                    </div>
                    <button onClick={handleGenerateInvestmentReport} className="flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-700">
                        <FileText size={16} className="mr-2"/>
                        {t('generateInvestmentReport', lang)}
                    </button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{t('allInvestments', lang)}</h3>
                    <button onClick={() => handleOpenInvestmentModal()} className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700">
                        <PlusCircle size={18} className="mr-2" />
                        {t('addInvestment', lang)}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('investmentName', lang)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('amount', lang)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('date', lang)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('description', lang)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions', lang)}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {investments.map(inv => (
                                <tr key={inv.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{inv.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(inv.amount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(inv.date, lang)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{inv.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                        <button onClick={() => handleOpenInvestmentModal(inv)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"><Edit size={18} /></button>
                                        <button onClick={() => handleDeleteInvestment(inv.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {investments.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('noInvestments', lang)}</p>}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{t('allTransactions', lang)}</h3>
                    <button onClick={() => handleOpenTransactionModal()} className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700">
                        <PlusCircle size={18} className="mr-2" />
                        {t('addTransaction', lang)}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                         <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('description', lang)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('amount', lang)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('type', lang)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('date', lang)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions', lang)}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {transactions.map(tx => {
                                const isReadOnly = !!tx.relatedInvestmentId || !!tx.relatedProductId;
                                return (
                                <tr key={tx.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{tx.description}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(tx.amount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{t(tx.type, lang)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(tx.date, lang)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                        <button onClick={() => handleOpenTransactionModal(tx)} disabled={isReadOnly} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed"><Edit size={18} /></button>
                                        <button onClick={() => handleDeleteTransaction(tx.id)} disabled={isReadOnly} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                     {transactions.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('noTransactions', lang)}</p>}
                </div>
            </div>

            {isInvestmentModalOpen && (
                <InvestmentModal
                    isOpen={isInvestmentModalOpen}
                    onClose={() => setIsInvestmentModalOpen(false)}
                    onSave={handleSaveInvestment}
                    investment={investmentToEdit}
                    userId={user.id}
                    t={t}
                    lang={lang}
                />
            )}
            {isTransactionModalOpen && (
                <TransactionModal
                    isOpen={isTransactionModalOpen}
                    onClose={() => setIsTransactionModalOpen(false)}
                    onSave={handleSaveTransaction}
                    transaction={transactionToEdit}
                    userId={user.id}
                    t={t}
                    lang={lang}
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