import React, { useState, useEffect } from 'react';
import { Project, Site, ProjectStatus } from '../types';
import { generateDescription } from '../services/geminiService';
import { X, Bot, Loader } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: Omit<Project, 'id'>) => void;
  sites: Site[];
  initialSiteId: number | null;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onAddProject, sites, initialSiteId }) => {
  const createInitialState = () => ({
    siteId: initialSiteId || (sites.length > 0 ? sites[0].id : 0),
    name: '',
    description: '',
    cropType: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    expectedYield: 0,
    status: ProjectStatus.PLANNING,
  });

  const [formData, setFormData] = useState(createInitialState());
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setFormData(createInitialState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialSiteId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'siteId' || name === 'expectedYield' ? Number(value) : value }));
  };
  
  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.cropType) {
      alert("Please enter a Project Name and Crop Type first.");
      return;
    }
    setIsGenerating(true);
    const prompt = `Generate a brief, engaging project description for a farming project named "${formData.name}" that cultivates "${formData.cropType}".`;
    const desc = await generateDescription(prompt);
    setFormData(prev => ({...prev, description: desc}));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.siteId) {
        alert("Please select a site for the project.");
        return;
    }
    onAddProject(formData);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">Create New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Project Name</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label htmlFor="cropType" className="block text-sm font-medium text-gray-700">Crop Type</label>
                <input type="text" name="cropType" id="cropType" value={formData.cropType} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
              </div>
            </div>
             <div>
                <label htmlFor="siteId" className="block text-sm font-medium text-gray-700">Farm Site</label>
                <select name="siteId" id="siteId" value={formData.siteId} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
                    {sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
                </select>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" id="description" rows={3} value={formData.description} onChange={handleChange} required className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"></textarea>
              <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="mt-2 flex items-center space-x-2 text-sm font-medium text-green-600 hover:text-green-800 disabled:opacity-50">
                {isGenerating ? <Loader className="animate-spin" size={16} /> : <Bot size={16} />}
                <span>{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
              </div>
            </div>
            <div>
              <label htmlFor="expectedYield" className="block text-sm font-medium text-gray-700">Expected Yield (kg)</label>
              <input type="number" name="expectedYield" id="expectedYield" value={formData.expectedYield} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>
          <div className="bg-gray-50 p-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700">
              Add Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;