import React, { useState, useEffect } from 'react';
import { User, Site, Project, Role } from '../types';
import { updateProfile } from '../services/authService';
import { Save, Edit, Mail, Phone, MapPin, PlusCircle, Building } from 'lucide-react';
import AddSiteForm from './AddSiteForm';

interface ProfileProps {
    currentUser: User;
    onUpdateUser: (user: User) => void;
    sites: Site[];
    projects: Project[];
    onAddSite: (data: { name: string; location: string; }) => void;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, onUpdateUser, sites, projects, onAddSite }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingSite, setIsAddingSite] = useState(false);
    const [formData, setFormData] = useState<User>(currentUser);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState('');
    
    const isFarmer = currentUser.role === Role.FARMER || currentUser.role === Role.BOTH;

    useEffect(() => {
        setFormData(currentUser);
    }, [currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setNotification('');
        const updatedUser = await updateProfile(formData);
        if (updatedUser) {
            onUpdateUser(updatedUser);
            setNotification('Profile updated successfully!');
            setIsEditing(false);
        } else {
            setNotification('Failed to update profile. Please try again.');
        }
        setIsLoading(false);
        setTimeout(() => setNotification(''), 3000);
    };

    return (
        <div className="space-y-8">
            {/* Profile Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">My Profile Information</h2>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors">
                            <Edit size={16} />
                            <span>Edit Profile</span>
                        </button>
                    )}
                </div>

                {notification && <div className="mb-4 p-3 rounded-md bg-green-100 text-green-800 text-sm">{notification}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 rounded-full bg-emerald-600 text-white flex items-center justify-center text-4xl font-bold">
                            {currentUser.name.charAt(0)}
                        </div>
                        <div>
                            {isEditing ? (
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="text-2xl font-bold border-b-2" />
                            ) : (
                                <h3 className="text-2xl font-bold text-gray-800">{currentUser.name}</h3>
                            )}
                            <p className="text-gray-500 capitalize">{currentUser.role.toLowerCase()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-stone-200">
                         <div>
                            <label className="flex items-center text-sm font-medium text-gray-500 mb-1"><Mail size={14} className="mr-2"/> Email Address</label>
                            <p className="text-gray-600">{formData.email}</p>
                        </div>
                         <div>
                            <label className="flex items-center text-sm font-medium text-gray-500 mb-1"><Phone size={14} className="mr-2"/> Phone Number</label>
                            {isEditing ? (
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="text-gray-800 font-medium p-1 border-b-2" />
                            ) : (
                                <p className="text-gray-800 font-medium">{formData.phone}</p>
                            )}
                        </div>
                         <div>
                            <label className="flex items-center text-sm font-medium text-gray-500 mb-1"><MapPin size={14} className="mr-2"/> Location</label>
                             <p className="text-gray-800 font-medium">{formData.location}</p>
                        </div>
                    </div>
                    
                    {isEditing && (
                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={() => { setIsEditing(false); setFormData(currentUser); }} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-emerald-600 border border-transparent rounded-lg text-sm font-semibold text-white hover:bg-emerald-700 flex items-center space-x-2 disabled:opacity-50 transition-colors">
                                <Save size={16} />
                                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                        </div>
                    )}
                </form>
            </div>
            
            {/* Farmer-specific sections */}
            {isFarmer && (
                <>
                 {/* Farm Sites Card */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">My Farm Sites</h2>
                         <button onClick={() => setIsAddingSite(!isAddingSite)} className="flex items-center space-x-2 text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors">
                            <PlusCircle size={16} />
                            <span>{isAddingSite ? 'Cancel' : 'Add Site'}</span>
                        </button>
                    </div>
                    {isAddingSite && <AddSiteForm onSave={(data) => { onAddSite(data); setIsAddingSite(false); }} onCancel={() => setIsAddingSite(false)} />}
                    <div className="space-y-3">
                        {sites.map(site => (
                            <div key={site.id} className="p-3 bg-stone-50 rounded-lg flex items-center space-x-4">
                               <Building className="text-emerald-600" />
                               <div>
                                 <p className="font-semibold text-gray-800">{site.name}</p>
                                 <p className="text-sm text-gray-500">{site.location}</p>
                               </div>
                            </div>
                        ))}
                         {sites.length === 0 && !isAddingSite && <p className="text-sm text-gray-500">No sites added yet.</p>}
                    </div>
                 </div>
                </>
            )}
        </div>
    );
};

export default Profile;