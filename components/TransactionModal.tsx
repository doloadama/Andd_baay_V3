import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Project, ExpenseCategory } from '../types';
import { t, Language } from '../utils/i18n';
import { MOCK_SITES, MOCK_PROJECTS } from '../constants';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Transaction, 'id' | 'userId'>, id: number | null) => void;
    transaction: Transaction | null;
    userId: number;
    t: (key: any, lang: Language) => string;
    lang: Language;
}

const initialFormData = {
    type: 'expense' as 'income' | 'expense',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    siteId: null as number | null,
    projectId: null as number | null,
    category: ExpenseCategory.SUPPLIES,
};

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, transaction, userId, t, lang }) => {
    const [formData, setFormData] = useState(initialFormData);
    
    const userSites = useMemo(() => MOCK_SITES.filter(s => s.farmerId === userId), [userId]);
    const availableProjects = useMemo(() => {
        if (!formData.siteId) return [];
        return MOCK_PROJECTS.filter(p => p.siteId === formData.siteId);
    }, [formData.siteId]);

    useEffect(() => {
        if (transaction) {
            setFormData({
                type: transaction.type,
                amount: transaction.amount,
                date: transaction.date,
                description: transaction.description,
                siteId: transaction.siteId || null,
                projectId: transaction.projectId || null,
                category: transaction.category || ExpenseCategory.OTHER,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [transaction, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'siteId') {
            const newSiteId = value ? Number(value) : null;
            setFormData(prev => ({
                ...prev,
                siteId: newSiteId,
                projectId: null // Reset project when site changes
            }));
        } else if (name === 'projectId' || name === 'amount') {
            setFormData(prev => ({ ...prev, [name]: value ? Number(value) : null }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            amount: Number(formData.amount),
        };
        // Remove category if it's an income transaction
        if (dataToSave.type === 'income') {
            delete dataToSave.category;
        }
        onSave(dataToSave, transaction ? transaction.id : null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                    {transaction ? t('editTransaction', lang) : t('addTransaction', lang)}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('transactionType', lang)}</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                            <option value="income">{t('income', lang)}</option>
                            <option value="expense">{t('expense', lang)}</option>
                        </select>
                    </div>
                     {formData.type === 'expense' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('category', lang)}</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{t(cat, lang)}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('amount', lang)}</label>
                        <input type="number" name="amount" value={formData.amount} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('date', lang)}</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('description', lang)}</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={2} required className="mt-1 w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('relatedSite', lang)}</label>
                        <select name="siteId" value={formData.siteId || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                            <option value="">{t('noSpecificSite', lang)}</option>
                            {userSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('relatedProject', lang)}</label>
                        <select name="projectId" value={formData.projectId || ''} onChange={handleChange} disabled={!formData.siteId} className="mt-1 w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-600">
                            <option value="">{t('noSpecificProject', lang)}</option>
                            {availableProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel', lang)}</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">{t('save', lang)}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;