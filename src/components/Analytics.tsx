import React, { useState, useMemo } from 'react';
import { User, ProjectStatus } from '../types';
import { getMarketInsights } from '../services/geminiService';
// Fix: Update t function prop and usage to align with App.tsx
import { Language } from '../utils/i18n';
import { MOCK_PROJECTS, MOCK_PRODUCTS } from '../constants';
import { formatCurrency } from '../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AnalyticsProps {
  user: User;
  t: (key: any, options?: any) => string;
  lang: Language;
  isDarkMode: boolean;
}

const PIE_CHART_COLORS = {
    [ProjectStatus.PLANNING]: '#A0AEC0',
    [ProjectStatus.IN_PROGRESS]: '#4299E1',
    [ProjectStatus.HARVESTING]: '#F6E05E',
    [ProjectStatus.COMPLETED]: '#48BB78',
};

const Analytics: React.FC<AnalyticsProps> = ({ user, t, lang, isDarkMode }) => {
    const [query, setQuery] = useState('Mango price trends in West Africa');
    const [insights, setInsights] = useState('');
    const [loadingInsights, setLoadingInsights] = useState(false);

    const analyticsData = useMemo(() => {
        const projectStatusData = MOCK_PROJECTS.reduce((acc, project) => {
            const status = project.status;
            const existing = acc.find(item => item.name === status);
            if (existing) {
                existing.value += 1;
            } else {
                acc.push({ name: status, value: 1 });
            }
            return acc;
        }, [] as { name: string; value: number }[]);

        const revenueByCropData = MOCK_PRODUCTS.reduce((acc, product) => {
            const cropType = product.cropType;
            const revenue = product.price * product.quantity;
            const existing = acc.find(item => item.name === cropType);
            if (existing) {
                existing.revenue += revenue;
            } else {
                acc.push({ name: cropType, revenue: revenue });
            }
            return acc;
        }, [] as { name: string; revenue: number }[]);

        const yieldByCropData = MOCK_PROJECTS.reduce((acc, project) => {
            const cropType = project.cropType;
            const expectedYield = project.expectedYield;
            const existing = acc.find(item => item.name === cropType);
            if (existing) {
                existing.yield += expectedYield;
            } else {
                acc.push({ name: cropType, yield: expectedYield });
            }
            return acc;
        }, [] as { name: string; yield: number }[]);

        return { projectStatusData, revenueByCropData, yieldByCropData };
    }, []);

    const handleGetInsights = async () => {
        if (!query.trim()) return;
        setLoadingInsights(true);
        setInsights('');
        const result = await getMarketInsights(query);
        setInsights(result);
        setLoadingInsights(false);
    };

    const axisColor = isDarkMode ? '#A0AEC0' : '#4A5568';
    const gridColor = isDarkMode ? '#374151' : '#E5E7EB';
    
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) { // Hide label for slices smaller than 5%
            return null;
        }

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontWeight="bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">{t('analyticsAndInsights')}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('projectStatusDistribution')}</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={analyticsData.projectStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                            >
                                {analyticsData.projectStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[entry.name as ProjectStatus]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', border: `1px solid ${gridColor}`, borderRadius: '0.5rem' }} />
                            <Legend wrapperStyle={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                 <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('revenueByCrop')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.revenueByCropData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
                            <XAxis dataKey="name" stroke={axisColor} />
                            <YAxis tickFormatter={(value) => formatCurrency(value)} stroke={axisColor}/>
                            <Tooltip cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }} formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', border: `1px solid ${gridColor}`, borderRadius: '0.5rem' }}/>
                            <Legend wrapperStyle={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}/>
                            <Bar dataKey="revenue" fill="#48BB78" name={t('totalRevenue')}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('yieldByCrop')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.yieldByCropData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
                        <XAxis dataKey="name" stroke={axisColor}/>
                        <YAxis tickFormatter={(value) => `${value.toLocaleString()} kg`} stroke={axisColor}/>
                        <Tooltip cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }} formatter={(value: number) => `${value.toLocaleString()} kg`} contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', border: `1px solid ${gridColor}`, borderRadius: '0.5rem' }}/>
                        <Legend wrapperStyle={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}/>
                        <Bar dataKey="yield" fill="#4299E1" name={t('expectedYield')} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">{t('aiInsightsTitle')}</h3>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('aiInsightsPlaceholder')}
                        className="flex-grow p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleGetInsights}
                        disabled={loadingInsights}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition duration-150"
                    >
                        {loadingInsights ? t('aiInsightsAnalyzing') : t('aiInsightsButton')}
                    </button>
                </div>
                {insights && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('analysisResults')}</h4>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{insights}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;