import React from 'react';
import { User, Project, Product, Transaction, ProjectStatus } from '../types';
import { MOCK_PROJECTS, MOCK_PRODUCTS, MOCK_TRANSACTIONS } from '../constants';
import { formatCurrency, formatDate } from '../utils/formatters';
import { t, Language } from '../utils/i18n';

interface DashboardProps {
    user: User;
    t: (key: any, lang: Language, options?: any) => string;
    lang: Language;
}

const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case ProjectStatus.COMPLETED: return 'bg-green-100 text-green-800';
        case ProjectStatus.HARVESTING: return 'bg-yellow-100 text-yellow-800';
        case ProjectStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
        case ProjectStatus.PLANNING: return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const Dashboard: React.FC<DashboardProps> = ({ user, t, lang }) => {
    const userProjects = MOCK_PROJECTS.filter(p => p.id <= 3); // Mock: show first 3 projects
    const userProducts = MOCK_PRODUCTS.filter(p => p.farmerId === user.id);
    const userTransactions = MOCK_TRANSACTIONS.filter(t => t.userId === user.id);
    const totalIncome = userTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">{t('welcomeBack', lang, { name: user.name.split(' ')[0] })}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500 text-sm font-medium">{t('activeProjects', lang)}</h3>
                    <p className="text-3xl font-bold text-gray-800">{userProjects.filter(p => p.status !== ProjectStatus.COMPLETED).length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500 text-sm font-medium">{t('productsListed', lang)}</h3>
                    <p className="text-3xl font-bold text-gray-800">{userProducts.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500 text-sm font-medium">{t('totalIncomeMock', lang)}</h3>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500 text-sm font-medium">{t('location', lang)}</h3>
                    <p className="text-3xl font-bold text-gray-800">{user.location}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">{t('yourRecentProjects', lang)}</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('projectName', lang)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('cropType', lang)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('endDate', lang)}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status', lang)}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {userProjects.map(project => (
                                <tr key={project.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.cropType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(project.endDate, lang)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                                            {project.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
