import React, { useState } from 'react';
import { Transaction, Investment, User } from '../types';
import { DollarSign, TrendingUp, TrendingDown, PlusCircle } from 'lucide-react';

interface FinanceProps {
    transactions: Transaction[];
    investments: Investment[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    setInvestments: React.Dispatch<React.SetStateAction<Investment[]>>;
    currentUser: User;
}

const Finance: React.FC<FinanceProps> = ({ transactions, investments, setInvestments, currentUser }) => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpense;
    const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
    
    const [isAddingInvestment, setIsAddingInvestment] = useState(false);
    const [newInvestment, setNewInvestment] = useState({ name: '', amount: 0, date: new Date().toISOString().split('T')[0], description: '' });

    const handleAddInvestment = (e: React.FormEvent) => {
        e.preventDefault();
        const investmentToAdd: Investment = {
            id: Math.max(0, ...investments.map(i => i.id)) + 1,
            farmerId: currentUser.id,
            ...newInvestment,
            relatedProjectId: null
        };
        setInvestments(prev => [...prev, investmentToAdd]);
        setNewInvestment({ name: '', amount: 0, date: new Date().toISOString().split('T')[0], description: '' });
        setIsAddingInvestment(false);
    };

    const stats = [
        { label: 'Total Income', value: `$${totalIncome.toLocaleString()}`, icon: TrendingUp, color: 'text-green-500' },
        { label: 'Total Expenses', value: `$${totalExpense.toLocaleString()}`, icon: TrendingDown, color: 'text-red-500' },
        { label: 'Net Profit', value: `$${netProfit.toLocaleString()}`, icon: DollarSign, color: netProfit >= 0 ? 'text-blue-500' : 'text-red-500' },
        { label: 'Total Investments', value: `$${totalInvested.toLocaleString()}`, icon: DollarSign, color: 'text-indigo-500' },
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

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Recent Transactions */}
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Transaction History</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {transactions.length > 0 ? transactions.map(t => (
                            <div key={t.id} className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-700">{t.description}</p>
                                    <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                                </div>
                                <p className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                                </p>
                            </div>
                        )) : <p className="text-center text-gray-500 py-8">No transactions recorded yet.</p>}
                    </div>
                </div>

                {/* Investments */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Investments</h3>
                        <button onClick={() => setIsAddingInvestment(!isAddingInvestment)} className="flex items-center space-x-2 text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors">
                            <PlusCircle size={16} />
                            <span>{isAddingInvestment ? 'Cancel' : 'Add'}</span>
                        </button>
                    </div>

                    {isAddingInvestment && (
                        <form onSubmit={handleAddInvestment} className="p-4 my-2 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-3">
                            <input type="text" placeholder="Investment Name" value={newInvestment.name} onChange={e => setNewInvestment({...newInvestment, name: e.target.value})} className="w-full text-sm p-2 border rounded" required/>
                            <input type="number" placeholder="Amount" value={newInvestment.amount} onChange={e => setNewInvestment({...newInvestment, amount: parseFloat(e.target.value) || 0})} className="w-full text-sm p-2 border rounded" required/>
                            <input type="date" value={newInvestment.date} onChange={e => setNewInvestment({...newInvestment, date: e.target.value})} className="w-full text-sm p-2 border rounded" required/>
                            <textarea placeholder="Description (optional)" value={newInvestment.description} onChange={e => setNewInvestment({...newInvestment, description: e.target.value})} className="w-full text-sm p-2 border rounded" rows={2}/>
                            <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold">Save Investment</button>
                        </form>
                    )}

                     <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {investments.length > 0 ? investments.map(i => (
                            <div key={i.id} className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-700">{i.name}</p>
                                    <p className="text-xs text-gray-500">{new Date(i.date).toLocaleDateString()}</p>
                                </div>
                                <p className="font-bold text-indigo-600">
                                    ${i.amount.toLocaleString()}
                                </p>
                            </div>
                        )) : !isAddingInvestment && <p className="text-center text-gray-500 py-8">No investments recorded yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Finance;