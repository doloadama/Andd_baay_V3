import React, { useState } from 'react';
import { Product, AvailabilityStatus, User, ProjectStatus } from '../types';
import { MOCK_PROJECTS } from '../constants';
import { t, Language } from '../utils/i18n';

interface ProductListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (product: Omit<Product, 'id' | 'farmerId'>) => void;
    user: User;
    t: (key: any, lang: Language) => string;
    lang: Language;
}

const ProductListingModal: React.FC<ProductListingModalProps> = ({ isOpen, onClose, onSubmit, user, t, lang }) => {
    const userProjects = MOCK_PROJECTS.filter(p => p.siteId <= 2); // Mock: projects for user
    const [formData, setFormData] = useState({
        projectId: userProjects[0]?.id || 0,
        productName: '',
        quantity: 0,
        price: 0,
        unit: 'kg',
        availabilityStatus: AvailabilityStatus.AVAILABLE,
        imageUrl: '',
        location: user.location,
        cropType: '',
        projectStatus: ProjectStatus.PLANNING,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numValue = (name === 'quantity' || name === 'price' || name === 'projectId') ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: numValue }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setFormData(prev => ({ ...prev, imageUrl: result }));
                setImagePreview(result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedProject = MOCK_PROJECTS.find(p => p.id === formData.projectId);
        if (!selectedProject) return;
        
        const finalData = { ...formData, 
            cropType: selectedProject.cropType,
            projectStatus: selectedProject.status,
            location: user.location, // Assuming product location is same as user
        };
        onSubmit(finalData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('newProductListingTitle', lang)}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('projectName', lang)}</label>
                        <select name="projectId" value={formData.projectId} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md">
                           {userProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('productName', lang)}</label>
                        <input type="text" name="productName" value={formData.productName} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('quantity', lang)}</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('pricePerUnit', lang)}</label>
                            <input type="number" name="price" step="0.01" value={formData.price} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('unit', lang)}</label>
                        <input type="text" name="unit" value={formData.unit} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('availability', lang)}</label>
                         <select name="availabilityStatus" value={formData.availabilityStatus} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md">
                            <option value={AvailabilityStatus.AVAILABLE}>{t('available', lang)}</option>
                            <option value={AvailabilityStatus.OUT_OF_STOCK}>{t('outOfStock', lang)}</option>
                            <option value={AvailabilityStatus.PRE_ORDER}>{t('preOrder', lang)}</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('productImage', lang)}</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 w-full p-2 border rounded-md" />
                        {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-24 w-auto rounded"/>}
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{t('cancel', lang)}</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">{t('submitListing', lang)}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default ProductListingModal;
