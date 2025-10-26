import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { MALI_REGIONS } from '../constants';

interface AddSiteFormProps {
    onSave: (data: { name: string; location: string; }) => void;
    onCancel: () => void;
}

const AddSiteForm: React.FC<AddSiteFormProps> = ({ onSave, onCancel }) => {
    const [newSiteData, setNewSiteData] = useState({ name: '', location: MALI_REGIONS[0] });

    const handleNewSiteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewSiteData(prev => ({...prev, [name]: value}));
    };

    const handleSaveNewSite = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSiteData.name && newSiteData.location) {
            onSave(newSiteData);
            setNewSiteData({ name: '', location: MALI_REGIONS[0] });
        }
    };

    return (
        <form onSubmit={handleSaveNewSite} className="p-4 my-4 bg-green-50/50 rounded-lg border border-green-200 space-y-3">
            <h4 className="font-semibold text-gray-800">Add New Farm Site</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    name="name"
                    value={newSiteData.name}
                    onChange={handleNewSiteChange}
                    placeholder="Site Name (e.g., 'River Field')"
                    required
                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
                <select
                    name="location"
                    value={newSiteData.location}
                    onChange={handleNewSiteChange}
                    required
                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 bg-white"
                >
                    {MALI_REGIONS.map(region => (
                        <option key={region} value={region}>{region}</option>
                    ))}
                </select>
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onCancel} className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"><X size={16}/></button>
                <button type="submit" className="p-2 text-green-600 hover:text-green-800 rounded-md hover:bg-green-100"><Save size={16}/></button>
            </div>
        </form>
    );
};

export default AddSiteForm;