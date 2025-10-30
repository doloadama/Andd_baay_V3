import React, { useState, useEffect } from 'react';
import { Project, Site, ProjectStatus } from '../types';
import { MOCK_SITES } from '../constants';
import { generateDescription } from '../services/geminiService';
import { t, Language } from '../utils/i18n';

const initialFormData = {
    siteId: 0,
    name: '',
    description: '',
    cropType: '',
    startDate: '',
    endDate: '',
    expectedYield: 0,
    status: ProjectStatus.PLANNING,
};

interface ProjectEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (projectData: Omit<Project, 'id'>, id: number | null) => void;
    project: Project | null;
    userId: number;
    siteId?: number;
    t: (key: any, lang: Language) => string;
    lang: Language;
}

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({ isOpen, onClose, onSave, project, userId, siteId, t, lang }) => {
    const userSites = MOCK_SITES.filter(s => s.farmerId === userId);
    const [formData, setFormData] = useState(initialFormData);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (project) {
            setFormData({
                siteId: project.siteId,
                name: project.name,
                description: project.description,
                cropType: project.cropType,
                startDate: project.startDate,
                endDate: project.endDate,
                expectedYield: project.expectedYield,
                status: project.status,
            });
        } else {
            const defaultSiteId = siteId || (userSites.length > 0 ? userSites[0].id : 0);
            setFormData({...initialFormData, siteId: defaultSiteId});
        }
    }, [project, isOpen, userSites, siteId]);

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
        onSave(formData, project ? project.id : null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                    {project ? t('editProject', lang) : t('newProjectTitle', lang)}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('projectName', lang)}</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('cropType', lang)}</label>
                        <input type="text" name="cropType" value={formData.cropType} onChange={handleChange} required className="mt-1 w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('description', lang)}</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"></textarea>
                        <button type="button" onClick={handleGenerateDesc} disabled={isGenerating} className="text-sm text-blue-600 hover:underline mt-1 disabled:text-gray-400">
                            {isGenerating ? t('generating', lang) : t('generateWithAI', lang)}
                        </button>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('site', lang)}</label>
                        <select name="siteId" value={formData.siteId} onChange={handleChange} required disabled={!!siteId} className="mt-1 w-full p-2 border dark:border-gray-600 rounded-md disabled:bg-gray-200 dark:disabled:bg-gray-600 dark:bg-gray-700 dark:text-white">
                           {userSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('startDate', lang)}</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('endDate', lang)}</label>
                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('expectedYield', lang)}</label>
                        <input type="number" name="expectedYield" value={formData.expectedYield} onChange={handleChange} required className="mt-1 w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('status', lang)}</label>
                        <select name="status" value={formData.status} onChange={handleChange} required className="mt-1 w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                            {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
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

export default ProjectEditModal;