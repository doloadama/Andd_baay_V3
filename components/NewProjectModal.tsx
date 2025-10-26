import React, { useState } from 'react';
import { Project, Site, ProjectStatus } from '../types';
import { MOCK_SITES } from '../constants';
import { generateDescription } from '../services/geminiService';
import { t, Language } from '../utils/i18n';

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (project: Omit<Project, 'id'>) => void;
    userId: number;
    t: (key: any, lang: Language) => string;
    lang: Language;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onSubmit, userId, t, lang }) => {
    const userSites = MOCK_SITES.filter(s => s.farmerId === userId);
    const [formData, setFormData] = useState({
        siteId: userSites[0]?.id || 0,
        name: '',
        description: '',
        cropType: '',
        startDate: '',
        endDate: '',
        expectedYield: 0,
        status: ProjectStatus.PLANNING,
    });
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'expectedYield' || name === 'siteId' ? Number(value) : value }));
    };
    
    const handleGenerateDesc = async () => {
        if (!formData.name || !formData.cropType) {
            alert(t('newProjectNameCropTypeAlert', lang));
            return;
        }
        setIsGenerating(true);
        const prompt = `Generate a short, optimistic project description for a farm project in Mali. Project Name: "${formData.name}". Crop: "${formData.cropType}".`;
        const desc = await generateDescription(prompt);
        setFormData(prev => ({ ...prev, description: desc }));
        setIsGenerating(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('newProjectTitle', lang)}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('projectName', lang)}</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('cropType', lang)}</label>
                        <input type="text" name="cropType" value={formData.cropType} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('description', lang)}</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border rounded-md"></textarea>
                        <button type="button" onClick={handleGenerateDesc} disabled={isGenerating} className="text-sm text-blue-600 hover:underline mt-1 disabled:text-gray-400">
                            {isGenerating ? t('generating', lang) : t('generateWithAI', lang)}
                        </button>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('site', lang)}</label>
                        <select name="siteId" value={formData.siteId} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md">
                           {userSites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('startDate', lang)}</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('endDate', lang)}</label>
                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('expectedYield', lang)}</label>
                        <input type="number" name="expectedYield" value={formData.expectedYield} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{t('cancel', lang)}</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">{t('createProject', lang)}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewProjectModal;
