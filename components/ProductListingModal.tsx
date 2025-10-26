import React, { useState, useEffect } from 'react';
import { Product, Project, AvailabilityStatus, User, ProjectStatus } from '../types';
import { X, UploadCloud, Trash2 } from 'lucide-react';

interface ProductListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id' | 'imageUrl'>, imageFile: File | null) => void;
  onUpdateProduct: (product: Product, imageFile: File | null) => void;
  project: Project | null; // Can be null when adding from marketplace
  product: Product | undefined;
  projects: Project[]; // User's projects, for the dropdown
  allProducts: Product[]; // All products, to check for existing listings
  currentUser: User;
}

const ProductListingModal: React.FC<ProductListingModalProps> = ({ isOpen, onClose, onAddProduct, onUpdateProduct, project, product, projects, allProducts, currentUser }) => {
  
  const createInitialState = (selectedProject?: Project | null) => ({
    productName: product?.productName || selectedProject?.name || '',
    quantity: product?.quantity || 0,
    price: product?.price || 0,
    unit: product?.unit || 'kg',
    availabilityStatus: product?.availabilityStatus || AvailabilityStatus.AVAILABLE,
    projectId: product?.projectId || selectedProject?.id || 0,
    farmerId: currentUser.id,
    location: product?.location || 'N/A', // In a real app, you'd get location from siteId
    cropType: product?.cropType || selectedProject?.cropType || '',
    projectStatus: product?.projectStatus || selectedProject?.status!,
  });

  const [formData, setFormData] = useState(createInitialState(project));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  const eligibleProjects = projects.filter(p => 
    (p.status === ProjectStatus.HARVESTING || p.status === ProjectStatus.COMPLETED) &&
    !allProducts.some(prod => prod.projectId === p.id)
  );

  useEffect(() => {
    if (isOpen) {
      if (project) { // Edit mode or add from dashboard
        setFormData(createInitialState(project));
        setSelectedProjectId(project.id.toString());
      } else { // Add from marketplace
        setFormData(createInitialState(null));
        setSelectedProjectId('');
      }
      setImagePreview(product?.imageUrl || null);
      setImageFile(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, project, product]);
  
  useEffect(() => {
    if (!project && selectedProjectId) { // Add from marketplace flow
      const selectedProj = projects.find(p => p.id === parseInt(selectedProjectId));
      if (selectedProj) {
        setFormData(createInitialState(selectedProj));
      }
    }
  }, [selectedProjectId, project, projects]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const val = e.target.type === 'number' ? parseFloat(value) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) { // Editing existing product
      onUpdateProduct({ ...product, ...formData }, imageFile);
    } else { // Creating new product
      if (!formData.projectId) {
        alert("Please select a project to list.");
        return;
      }
      onAddProduct(formData, imageFile);
    }
  };

  if (!isOpen) return null;

  const isAddModeFromMarketplace = !project;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">{product ? 'Edit Product Listing' : 'Create Product Listing'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
            {/* Left Column: Form Fields */}
            <div className="space-y-4">
              {isAddModeFromMarketplace && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Project to Sell</label>
                  <select 
                    value={selectedProjectId} 
                    onChange={(e) => setSelectedProjectId(e.target.value)} 
                    required 
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="" disabled>-- Choose a project --</option>
                    {eligibleProjects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.cropType})</option>)}
                  </select>
                  {eligibleProjects.length === 0 && <p className="text-xs text-gray-500 mt-1">No available projects to list. Complete a project to create a listing.</p>}
                </div>
              )}

              <div className={(!selectedProjectId && isAddModeFromMarketplace) ? 'opacity-50' : ''}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" disabled={!selectedProjectId && isAddModeFromMarketplace} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" disabled={!selectedProjectId && isAddModeFromMarketplace} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" disabled={!selectedProjectId && isAddModeFromMarketplace} />
                  </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Unit</label>
                      <select name="unit" value={formData.unit} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" disabled={!selectedProjectId && isAddModeFromMarketplace}>
                          <option value="kg">kg</option>
                          <option value="item">item</option>
                          <option value="tonne">tonne</option>
                      </select>
                  </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select name="availabilityStatus" value={formData.availabilityStatus} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" disabled={!selectedProjectId && isAddModeFromMarketplace}>
                          {Object.values(AvailabilityStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column: Image Upload */}
            <div className={`space-y-2 ${(!selectedProjectId && isAddModeFromMarketplace) ? 'opacity-50' : ''}`}>
              <label className="block text-sm font-medium text-gray-700">Product Image</label>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Product preview" className="w-full h-40 object-cover rounded-md" />
                  <button type="button" onClick={clearImage} disabled={!selectedProjectId && isAddModeFromMarketplace} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/75">
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className={`relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none ${(!selectedProjectId && isAddModeFromMarketplace) ? 'pointer-events-none' : ''}`}>
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} disabled={!selectedProjectId && isAddModeFromMarketplace} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700" disabled={isAddModeFromMarketplace && !selectedProjectId}>
              {product ? 'Save Changes' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductListingModal;