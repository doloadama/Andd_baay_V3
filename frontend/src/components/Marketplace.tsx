import React, { useState, useMemo, useEffect } from 'react';
import { User, Product, AvailabilityStatus } from '../types';
import { MOCK_PRODUCTS, MOCK_PROJECTS } from '../constants';
import { formatCurrency } from '../utils/formatters';
import ProductListingModal from './ProductListingModal';
import ProductDetailModal from './ProductDetailModal';
// Fix: Update t function prop and usage to align with App.tsx
import { Language } from '../utils/i18n';
import { MapPin } from 'lucide-react';

interface MarketplaceProps {
    user: User;
    t: (key: any, options?: any) => string;
    lang: Language;
    addToCart: (productId: number, quantity: number) => void;
}

const getStatusColor = (status: AvailabilityStatus) => {
    switch (status) {
        case AvailabilityStatus.AVAILABLE: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case AvailabilityStatus.OUT_OF_STOCK: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case AvailabilityStatus.PRE_ORDER: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const PRODUCTS_PER_PAGE = 12;

const Marketplace: React.FC<MarketplaceProps> = ({ user, t, lang, addToCart }) => {
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [updatedProductIds, setUpdatedProductIds] = useState<Set<number>>(new Set());
    const [recentlyAdded, setRecentlyAdded] = useState<number | null>(null);
    const [filters, setFilters] = useState({
        availability: 'All',
        cropType: '',
        minPrice: '',
        maxPrice: '',
    });

    useEffect(() => {
        const priceUpdateInterval = setInterval(() => {
            setProducts(currentProducts => {
                const newProducts = [...currentProducts];
                const updatedIds = new Set<number>();

                const numUpdates = Math.floor(Math.random() * 2) + 1;
                for (let i = 0; i < numUpdates; i++) {
                    const productIndex = Math.floor(Math.random() * newProducts.length);
                    const productToUpdate = newProducts[productIndex];

                    if (productToUpdate) {
                        const changePercent = (Math.random() - 0.5) * 0.04; // Fluctuate by up to +/- 2%
                        const newPrice = productToUpdate.price * (1 + changePercent);
                        
                        newProducts[productIndex] = {
                            ...productToUpdate,
                            price: Math.max(0.1, parseFloat(newPrice.toFixed(2))),
                        };
                        updatedIds.add(productToUpdate.id);
                    }
                }
                
                if (updatedIds.size > 0) {
                    setUpdatedProductIds(updatedIds);
                    setTimeout(() => {
                        setUpdatedProductIds(new Set());
                    }, 1000); 
                }

                return newProducts;
            });
        }, 3000); 

        return () => clearInterval(priceUpdateInterval);
    }, []);

    const handleAddProduct = (newProduct: Omit<Product, 'id' | 'farmerId'>) => {
        const productToAdd: Product = {
            id: Math.max(...products.map(p => p.id)) + 1,
            farmerId: user.id,
            ...newProduct
        };
        setProducts(prev => [productToAdd, ...prev]);
    }
    
    const handleAddToCart = (productId: number) => {
        addToCart(productId, 1);
        setRecentlyAdded(productId);
        setTimeout(() => setRecentlyAdded(null), 1500);
    };
    
    const getTranslatedStatus = (status: AvailabilityStatus) => {
        const key = status.toLowerCase().replace(' ', '') as any;
        return t(key);
    }

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
    };

    const handleCloseDetailModal = () => {
        setSelectedProduct(null);
    };

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            if (filters.availability !== 'All' && product.availabilityStatus !== filters.availability) {
                return false;
            }
            if (filters.cropType && !product.cropType.toLowerCase().includes(filters.cropType.toLowerCase())) {
                return false;
            }
            const minPrice = parseFloat(filters.minPrice);
            if (!isNaN(minPrice) && product.price < minPrice) {
                return false;
            }
            const maxPrice = parseFloat(filters.maxPrice);
            if (!isNaN(maxPrice) && product.price > maxPrice) {
                return false;
            }
            return true;
        });
    }, [products, filters]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">{t('navMarketplace')}</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                >
                    {t('listNewProduct')}
                </button>
            </div>

            <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('filterProducts')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="availability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('filterByAvailability')}</label>
                        <select
                            id="availability"
                            name="availability"
                            value={filters.availability}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="All">{t('all')}</option>
                            <option value={AvailabilityStatus.AVAILABLE}>{t('available')}</option>
                            <option value={AvailabilityStatus.OUT_OF_STOCK}>{t('outOfStock')}</option>
                            <option value={AvailabilityStatus.PRE_ORDER}>{t('preOrder')}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('filterByCrop')}</label>
                        <input
                            type="text"
                            id="cropType"
                            name="cropType"
                            value={filters.cropType}
                            onChange={handleFilterChange}
                            placeholder={t('cropPlaceholder')}
                            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('priceRange')}</label>
                        <div className="flex items-center space-x-2 mt-1">
                            <input
                                type="number"
                                name="minPrice"
                                value={filters.minPrice}
                                onChange={handleFilterChange}
                                placeholder={t('minPrice')}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <span className="text-gray-500 dark:text-gray-400">-</span>
                             <input
                                type="number"
                                name="maxPrice"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                                placeholder={t('maxPrice')}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map(product => {
                    const isUpdating = updatedProductIds.has(product.id);
                    const isAdded = recentlyAdded === product.id;
                    return (
                        <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col transition-shadow hover:shadow-xl">
                            <div 
                                className="cursor-pointer"
                                onClick={() => handleProductClick(product)}
                            >
                                <img className="w-full h-48 object-cover" src={product.imageUrl} alt={product.productName} />
                                <div className="p-4 flex-grow">
                                    <div className="mb-2">
                                        <span className="inline-block bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                            {product.cropType}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate" title={product.productName}>{product.productName}</h3>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                        <MapPin size={14} className="mr-1 flex-shrink-0" />
                                        <span>{product.location}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                                            <span className={`transition-colors duration-500 rounded px-1 ${isUpdating ? 'bg-yellow-200 dark:bg-yellow-700' : 'bg-transparent'}`}>
                                                {formatCurrency(product.price)}
                                            </span> / {product.unit}
                                        </p>
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.availabilityStatus)}`}>
                                            {getTranslatedStatus(product.availabilityStatus)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                             <div className="p-4 pt-0 mt-auto">
                                <button
                                    onClick={() => handleAddToCart(product.id)}
                                    disabled={isAdded || product.availabilityStatus === AvailabilityStatus.OUT_OF_STOCK}
                                    className={`w-full py-2 rounded-md font-semibold transition duration-150 ${
                                        isAdded 
                                        ? 'bg-green-500 text-white' 
                                        : product.availabilityStatus === AvailabilityStatus.OUT_OF_STOCK
                                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {isAdded ? t('addedToCart') : (product.availabilityStatus === AvailabilityStatus.OUT_OF_STOCK ? t('outOfStock') : t('addToCart'))}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-lg text-gray-500 dark:text-gray-400">{t('noProductsMatch')}</p>
                </div>
            )}
            
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('previousPage')}
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 border text-sm font-medium rounded-md ${
                                currentPage === page
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('nextPage')}
                    </button>
                </div>
            )}

            {isModalOpen && (
                <ProductListingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAddProduct}
                    user={user}
                    t={t}
                    lang={lang}
                />
            )}

            {selectedProduct && (
                <ProductDetailModal
                    isOpen={!!selectedProduct}
                    onClose={handleCloseDetailModal}
                    product={selectedProduct}
                    project={MOCK_PROJECTS.find(p => p.id === selectedProduct.projectId)!}
                    addToCart={addToCart}
                    t={t}
                    lang={lang}
                />
            )}
        </div>
    );
};

export default Marketplace;