import React, { useState, useEffect } from 'react';
import { Investment } from '../types';
import { MOCK_PROJECTS } from '../constants';
import { Language } from '../utils/i18n';

interface InvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Investment, 'id' | 'farmerId'>, id: number | null) => void;
    investment: Investment | null;
    userId: number;
    t: (key: any, options?: any) => string;
    lang: Language;
}

const initialFormData = {
    name: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    relatedProjectId: null as number | null,
};

const InvestmentModal: React.FC<InvestmentModalProps> = ({ isOpen, onClose, onSave, investment, t }) => {
    const [formData, setFormData] = useState(initialFormData);

    const userProjects = MOCK_PROJECTS.filter(p => p.siteId <= 2); // Mock for user's projects

    useEffect(() => {
        if (investment) {
            setFormData({
                name: investment.name,
                amount: investment.amount,
                date: investment.date,
                description: investment.description,
                relatedProjectId: investment.relatedProjectId,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [investment, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            amount: Number(formData.amount),
            relatedProjectId: formData.relatedProjectId ? Number(formData.relatedProjectId) : null,
        };
        onSave(dataToSave, investment ? investment.id : null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                    {investment ? t('editInvestment') : t('addInvestment')}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('investmentName')}</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('amount')}</label>
                        <input type="number" name="amount" value={formData.amount} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('date')}</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')}</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('relatedProject')}</label>
                        <select name="relatedProjectId" value={formData.relatedProjectId || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                            <option value="">{t('noProject')}</option>
                            {userProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InvestmentModal;