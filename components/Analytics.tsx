import React from 'react';
import { Project, Transaction, Product, ProjectStatus } from '../types';
import { BarChart as BarChartIcon, PieChart as PieChartIcon, TrendingUp, DollarSign, Bot, Loader } from 'lucide-react';
import { getMarketInsights } from '../services/geminiService';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsProps {
    projects: Project[];
    products: Product[];
    transactions: Transaction[];
}

const Analytics: React.FC<AnalyticsProps> = ({ projects, products, transactions }) => {
    const [insight, setInsight] = React.useState('');
    const [isLoadingInsight, setIsLoadingInsight] = React.useState(false);
    
    const totalYield = projects.reduce((acc, p) => acc + p.expectedYield, 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const netProfit = totalIncome - totalExpense;

    const projectStatusData = Object.entries(
      projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as Record<ProjectStatus, number>)
    ).map(([name, value]) => ({ name, value }));

    const cropYieldData = Object.entries(
        projects.reduce((acc, project) => {
            acc[project.cropType] = (acc[project.cropType] || 0) + project.expectedYield;
            return acc;
        }, {} as Record<string, number>)
    ).map(([name, yieldVal]) => ({ name, yield: yieldVal })).sort((a,b) => b.yield - a.yield);
    
    const fetchInsight = async () => {
        setIsLoadingInsight(true);
        const mostCommonCrop = cropYieldData[0]?.name || 'general farming';
        const query = `What are the current market trends for ${mostCommonCrop} in Mali?`;
        const result = await getMarketInsights(query);
        setInsight(result);
        setIsLoadingInsight(false);
    }
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const stats = [
        { label: 'Total Income', value: `$${totalIncome.toLocaleString()}`, icon: DollarSign, color: 'text-green-500' },
        { label: 'Total Expense', value: `$${totalExpense.toLocaleString()}`, icon: DollarSign, color: 'text-red-500' },
        { label: 'Net Profit', value: `$${netProfit.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-500' },
        { label: 'Total Expected Yield', value: `${totalYield.toLocaleString()} kg`, icon: BarChartIcon, color: 'text-yellow-500' },
    ];

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {stats.map(stat => (
                    <div key={stat.label} className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 flex items-center space-x-4">
                        <div className={`p-3 rounded-lg bg-opacity-10 ${stat.color.replace('text-', 'bg-')}`}>
                           <stat.icon size={24} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* AI Market Insights */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                 <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center"><Bot className="mr-3 text-emerald-600"/> AI Market Insights</h3>
                    <button onClick={fetchInsight} disabled={isLoadingInsight} className="flex items-center space-x-2 text-sm font-semibold bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors">
                        {isLoadingInsight ? <Loader size={16} className="animate-spin"/> : <TrendingUp size={16}/>}
                        <span>{isLoadingInsight ? 'Analyzing...' : 'Generate New Insight'}</span>
                    </button>
                </div>
                {isLoadingInsight ? (
                    <div className="text-center py-8 text-gray-500">Analyzing market data...</div>
                ) : insight ? (
                    <div className="text-gray-700 prose prose-sm max-w-none">{insight}</div>
                ) : (
                    <p className="text-gray-500">Click the button to generate market insights based on your farm's data.</p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Status Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><PieChartIcon className="mr-2"/> Project Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={projectStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                // FIX: Explicitly convert percent to a number to satisfy TypeScript's type checker for arithmetic operations.
                                label={({ name, percent }) => `${name} ${((Number(percent) || 0) * 100).toFixed(0)}%`}
                            >
                                {projectStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Yield by Crop Type Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><BarChartIcon className="mr-2"/> Yield by Crop (kg)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={cropYieldData}
                            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="yield" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;