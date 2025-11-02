import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { MALI_REGIONS } from '../constants';
import { Language } from '../utils/i18n';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedUser: User) => void;
    user: User;
    t: (key: any, lang: Language) => string;
    lang: Language;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose, onSave, user, t, lang }) => {
    const [formData, setFormData] = useState<User>(user);

    useEffect(() => {
        setFormData(user);
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">{t('editProfileModalTitle', lang)}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('fullName', lang)}</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('emailAddress', lang)}</label>
                            <input type="email" name="email" value={formData.email} disabled className="mt-1 block w-full px-3 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('phoneNumber', lang)}</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('location', lang)}</label>
                            <select name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                {MALI_REGIONS.map(region => <option key={region} value={region}>{region}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('role', lang)}</label>
                            <input type="text" name="role" value={t(formData.role.toLowerCase(), lang)} disabled className="mt-1 block w-full px-3 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-8">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                            {t('cancel', lang)}
                        </button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            {t('saveChanges', lang)}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileEditModal;