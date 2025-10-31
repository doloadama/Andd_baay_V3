import React, { useState, useEffect } from 'react';
import { Site } from '../types';
import { MALI_REGIONS } from '../constants';

interface SiteEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (siteData: Omit<Site, 'id' | 'farmerId'>, id: number | null) => void;
    site: Site | null;
    t: (key: any, options?: any) => string;
}

const SiteEditModal: React.FC<SiteEditModalProps> = ({ isOpen, onClose, onSave, site, t }) => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState(MALI_REGIONS[0]);

    useEffect(() => {
        if (site) {
            setName(site.name);
            setLocation(site.location);
        } else {
            setName('');
            setLocation(MALI_REGIONS[0]);
        }
    }, [site, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, location }, site ? site.id : null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                    {site ? t('editSite') : t('addNewSite')}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('siteName')}</label>
                        <input
                            id="siteName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('location')}</label>
                        <select
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                            className="mt-1 block w-full p-2 border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {MALI_REGIONS.map(region => <option key={region} value={region}>{region}</option>)}
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

export default SiteEditModal;