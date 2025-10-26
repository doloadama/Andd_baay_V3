import React, { useState } from 'react';
import { User, Product, AvailabilityStatus } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import { formatCurrency } from '../utils/formatters';
import ProductListingModal from './ProductListingModal';
import { t, Language } from '../utils/i18n';

interface MarketplaceProps {
    user: User;
    t: (key: any, lang: Language) => string;
    lang: Language;
}

const getStatusColor = (status: AvailabilityStatus) => {
    switch (status) {
        case AvailabilityStatus.AVAILABLE: return 'bg-green-100 text-green-800';
        case AvailabilityStatus.OUT_OF_STOCK: return 'bg-red-100 text-red-800';
        case AvailabilityStatus.PRE_ORDER: return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const Marketplace: React.FC<MarketplaceProps> = ({ user, t, lang }) => {
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddProduct = (newProduct: Omit<Product, 'id' | 'farmerId'>) => {
        const productToAdd: Product = {
            id: Math.max(...products.map(p => p.id)) + 1,
            farmerId: user.id,
            ...newProduct
        };
        setProducts(prev => [productToAdd, ...prev]);
    }
    
    const getTranslatedStatus = (status: AvailabilityStatus) => {
        const key = status.toLowerCase().replace(' ', '') as any;
        return t(key, lang);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold text-gray-800">{t('navMarketplace', lang)}</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                >
                    {t('listNewProduct', lang)}
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                        <img className="w-full h-48 object-cover" src={product.imageUrl} alt={product.productName} />
                        <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-800">{product.productName}</h3>
                            <p className="text-sm text-gray-500 mb-2">{product.location}</p>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xl font-semibold text-green-600">{formatCurrency(product.price)} / {product.unit}</p>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.availabilityStatus)}`}>
                                    {getTranslatedStatus(product.availabilityStatus)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">Available: {product.quantity} {product.unit}</p>
                            <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-150">
                                {t('contactSeller', lang)}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
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
        </div>
    );
};

export default Marketplace;
