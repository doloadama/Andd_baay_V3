import React, { useState, useMemo } from 'react';
import { Product, User, Project, ProjectStatus, Role } from '../types';
import { Search, MapPin, Tag, PlusCircle, UserCircle } from 'lucide-react';
import ProductListingModal from './ProductListingModal';

interface MarketplaceProps {
    allProducts: Product[];
    userProjects: Project[];
    currentUser: User | null;
    onAddProduct: (product: Omit<Product, 'id' | 'imageUrl'>, imageFile: File | null) => void;
    onUpdateProduct: (product: Product, imageFile: File | null) => void;
    allUsers: User[];
}

const Marketplace: React.FC<MarketplaceProps> = ({ allProducts, userProjects, currentUser, onAddProduct, onUpdateProduct, allUsers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isListingModalOpen, setIsListingModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    
    const isFarmer = currentUser?.role === Role.FARMER || currentUser?.role === Role.BOTH;
    
    const eligibleProjects = useMemo(() => userProjects.filter(p => 
      (p.status === ProjectStatus.HARVESTING || p.status === ProjectStatus.COMPLETED) &&
      !allProducts.some(prod => prod.projectId === p.id)
    ), [userProjects, allProducts]);

    const handleEditListing = (product: Product) => {
        setEditingProduct(product);
        setIsListingModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsListingModalOpen(false);
        setEditingProduct(undefined); // Clear editing state on close
    };

    const filteredProducts = allProducts.filter(product =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const getSeller = (farmerId: number) => allUsers.find(u => u.id === farmerId);

    return (
        <div className="space-y-8">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by product, crop, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                </div>
                {isFarmer && (
                     <button 
                      onClick={() => setIsListingModalOpen(true)}
                      disabled={eligibleProjects.length === 0}
                      className="w-full md:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none group"
                      title={eligibleProjects.length === 0 ? "You have no projects ready for listing." : "Add a new product to the marketplace"}
                    >
                        <PlusCircle size={20} />
                        <span>{eligibleProjects.length > 0 ? 'Add Your Product' : 'No Projects Ready'}</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                    <ProductCard 
                        key={product.id} 
                        product={product}
                        isOwner={product.farmerId === currentUser?.id}
                        onEdit={handleEditListing}
                        seller={getSeller(product.farmerId)}
                    />
                ))}
            </div>
            
            {(isFarmer && isListingModalOpen) && <ProductListingModal
                isOpen={isListingModalOpen}
                onClose={handleCloseModal}
                onAddProduct={onAddProduct}
                onUpdateProduct={onUpdateProduct}
                project={editingProduct ? userProjects.find(p => p.id === editingProduct.projectId) || null : null}
                product={editingProduct}
                projects={userProjects}
                allProducts={allProducts}
                currentUser={currentUser!}
            />}
        </div>
    );
};


interface ProductCardProps {
    product: Product;
    isOwner: boolean;
    onEdit: (product: Product) => void;
    seller?: User;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isOwner, onEdit, seller }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <div className="relative">
                <img src={product.imageUrl} alt={product.productName} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <h3 className="absolute bottom-3 left-4 text-lg font-bold text-white">{product.productName}</h3>
                {isOwner && <div className="absolute top-2 right-2 text-xs font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-full">Your Listing</div>}
            </div>
            <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-2xl font-bold text-emerald-600">${product.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">per {product.unit}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-gray-800">{product.quantity.toLocaleString()} {product.unit}</p>
                        <p className="text-sm text-gray-500">Available</p>
                    </div>
                </div>
                 <div className="text-xs space-y-1">
                    <div className="flex items-center text-gray-600"><Tag size={12} className="mr-1.5"/> Crop: <span className="font-medium ml-1">{product.cropType}</span></div>
                    <div className="flex items-center text-gray-600"><MapPin size={12} className="mr-1.5"/> From: <span className="font-medium ml-1">{product.location}</span></div>
                </div>
                
                <div className="pt-3 border-t border-stone-200">
                    {isOwner ? (
                        <button 
                            onClick={() => onEdit(product)}
                            className="w-full px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            Edit Your Listing
                        </button>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-stone-200 text-emerald-700 flex items-center justify-center font-bold">
                                {seller?.name.charAt(0) || <UserCircle size={18} />}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{seller?.name || 'Unknown Seller'}</p>
                                <p className="text-xs text-gray-500 hover:text-emerald-600 cursor-pointer">Contact Seller</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Marketplace;