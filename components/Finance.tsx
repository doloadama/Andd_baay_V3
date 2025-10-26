import React from 'react';
import { User, Transaction, Investment } from '../types';
import { MOCK_TRANSACTIONS, MOCK_INVESTMENTS } from '../constants';
import { formatCurrency, formatDate } from '../utils/formatters';
import { t, Language } from '../utils/i18n';

interface FinanceProps {
    user: User;
    t: (key: any, lang: Language) => string;
    lang: Language;
}

const Finance: React.FC<FinanceProps> = ({ user, t, lang }) => {
    const userTransactions = MOCK_TRANSACTIONS.filter(t => t.userId === user.id);
    const userInvestments = MOCK_INVESTMENTS.filter(i => i.farmerId === user.id);

    const totalIncome = userTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = userTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">{t('financialOverview', lang)}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-gray-500 text-sm font-medium">{t('totalIncome', lang)}</h3>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-gray-500 text-sm font-medium">{t('totalExpenses', lang)}</h3>
                    <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-gray-500 text-sm font-medium">{t('netBalance', lang)}</h3>
                    <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(netBalance)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">{t('recentTransactions', lang)}</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead><tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{t('date', lang)}</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{t('description', lang)}</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">{t('amount', lang)}</th>
                            </tr></thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {userTransactions.map(t => (
                                    <tr key={t.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatDate(t.date, lang)}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{t.description}</td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-right font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">{t('investments', lang)}</h3>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead><tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{t('date', lang)}</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{t('name', lang)}</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">{t('amount', lang)}</th>
                            </tr></thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {userInvestments.map(i => (
                                    <tr key={i.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatDate(i.date, lang)}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{i.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-semibold text-blue-600">
                                            {formatCurrency(i.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Finance;
