import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import * as authService from '../services/authService';
import { MALI_REGIONS } from '../constants';
import { t, Language } from '../utils/i18n';

interface ProfileProps {
    user: User;
    onProfileUpdate: (updatedUser: User) => void;
    t: (key: any, lang: Language) => string;
    lang: Language;
}

const Profile: React.FC<ProfileProps> = ({ user, onProfileUpdate, t, lang }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<User>(user);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setFormData(user);
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(t('updating', lang));
        const updatedUser = await authService.updateProfile(formData);
        if (updatedUser) {
            onProfileUpdate(updatedUser);
            setIsEditing(false);
            setMessage(t('profileUpdateSuccess', lang));
        } else {
            setMessage(t('profileUpdateFailed', lang));
        }
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">{t('navProfile', lang)}</h2>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        {t('editProfile', lang)}
                    </button>
                )}
            </div>
            {message && <p className="mb-4 text-center text-green-600">{message}</p>}

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('fullName', lang)}</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-200 dark:disabled:bg-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('emailAddress', lang)}</label>
                        <input type="email" name="email" value={formData.email} disabled className="mt-1 block w-full px-3 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('phoneNumber', lang)}</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-200 dark:disabled:bg-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('location', lang)}</label>
                        <select name="location" value={formData.location} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-200 dark:disabled:bg-gray-600">
                            {MALI_REGIONS.map(region => <option key={region} value={region}>{region}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('role', lang)}</label>
                        <input type="text" name="role" value={formData.role} disabled className="mt-1 block w-full px-3 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                    </div>
                </div>
                {isEditing && (
                    <div className="flex justify-end space-x-4 mt-8">
                        <button type="button" onClick={() => { setIsEditing(false); setFormData(user); }} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                            {t('cancel', lang)}
                        </button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            {t('saveChanges', lang)}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default Profile;