import React, { useState } from 'react';
import { User } from '../types';
import { getMarketInsights } from '../services/geminiService';
import { t, Language } from '../utils/i18n';

interface AnalyticsProps {
    user: User;
    t: (key: any, lang: Language) => string;
    lang: Language;
}

const Analytics: React.FC<AnalyticsProps> = ({ user, t, lang }) => {
    const [query, setQuery] = useState('Mango price trends in West Africa');
    const [insights, setInsights] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGetInsights = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setInsights('');
        const result = await getMarketInsights(query);
        setInsights(result);
        setLoading(false);
    };

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">{t('analyticsAndInsights', lang)}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('cropYieldOverTime', lang)}</h3>
                    <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <p className="text-gray-500 dark:text-gray-400">{t('chartPlaceholder', lang)}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('revenueVsExpenses', lang)}</h3>
                    <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <p className="text-gray-500 dark:text-gray-400">{t('chartPlaceholder', lang)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">{t('aiInsightsTitle', lang)}</h3>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('aiInsightsPlaceholder', lang)}
                        className="flex-grow p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleGetInsights}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition duration-150"
                    >
                        {loading ? t('aiInsightsAnalyzing', lang) : t('aiInsightsButton', lang)}
                    </button>
                </div>
                {insights && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('analysisResults', lang)}</h4>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{insights}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;