import React, { useState, MouseEvent } from 'react';
import { Product, Project, AvailabilityStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Language } from '../utils/i18n';
import { X, Minus, Plus, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ProductDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    project: Project;
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

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, onClose, product, project, t, lang, addToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    // State for image zoom and pan
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });

    if (!isOpen) return null;

    const getTranslatedStatus = (status: AvailabilityStatus) => {
        const key = status.toLowerCase().replace(' ', '') as any;
        return t(key);
    };

    const handleAddToCart = () => {
        addToCart(product.id, quantity);
        setIsAdded(true);
        setTimeout(() => {
            setIsAdded(false);
            onClose();
        }, 1500);
    };

    const handleQuantityChange = (amount: number) => {
        setQuantity(prev => Math.max(1, Math.min(product.quantity, prev + amount)));
    };
    
    // Image Zoom and Pan handlers
    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => {
        const newZoom = Math.max(zoomLevel - 0.2, 1);
        if (newZoom === 1) {
            handleResetZoom();
        } else {
            setZoomLevel(newZoom);
        }
    };
    const handleResetZoom = () => {
        setZoomLevel(1);
        setImagePosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: MouseEvent<HTMLImageElement>) => {
        if (zoomLevel <= 1) return;
        e.preventDefault();
        setIsPanning(true);
        setStartPanPosition({
            x: e.clientX - imagePosition.x,
            y: e.clientY - imagePosition.y,
        });
    };
    
    const handleMouseMove = (e: MouseEvent<HTMLImageElement>) => {
        if (!isPanning) return;
        e.preventDefault();
        setImagePosition({
            x: e.clientX - startPanPosition.x,
            y: e.clientY - startPanPosition.y,
        });
    };

    const handleMouseUp = () => setIsPanning(false);
    const handleMouseLeave = () => setIsPanning(false);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 z-20 p-1 bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 rounded-full">
                    <X size={24} />
                </button>
                <div className="w-full md:w-1/2 bg-gray-100 dark:bg-gray-900 relative overflow-hidden group">
                    <img
                        src={product.imageUrl}
                        alt={product.productName}
                        className="w-full h-full object-contain transition-transform duration-200 ease-out"
                        style={{
                            transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                            cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
                            height: '100%',
                            width: '100%'
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                    />
                     <div className="absolute top-2 right-2 z-10 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={handleZoomIn} className="p-2 bg-white bg-opacity-70 dark:bg-gray-800 dark:text-white rounded-full shadow-md hover:bg-opacity-100"><ZoomIn size={20} /></button>
                        <button onClick={handleZoomOut} className="p-2 bg-white bg-opacity-70 dark:bg-gray-800 dark:text-white rounded-full shadow-md hover:bg-opacity-100"><ZoomOut size={20} /></button>
                        {zoomLevel > 1 && <button onClick={handleResetZoom} className="p-2 bg-white bg-opacity-70 dark:bg-gray-800 dark:text-white rounded-full shadow-md hover:bg-opacity-100"><RotateCcw size={20} /></button>}
                    </div>
                </div>
                <div className="w-full md:w-1/2 p-6 overflow-y-auto">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.availabilityStatus)}`}>
                        {getTranslatedStatus(product.availabilityStatus)}
                    </span>
                    <h2 className="text-3xl font-bold mt-2 text-gray-800 dark:text-gray-100">{product.productName}</h2>
                    <p className="text-md text-gray-500 dark:text-gray-400 mb-4">{product.location}</p>

                    <div className="flex items-baseline mb-4">
                        <p className="text-4xl font-semibold text-green-600 dark:text-green-400">{formatCurrency(product.price)}</p>
                        <span className="text-lg text-gray-600 dark:text-gray-400 ml-2">/ {product.unit}</span>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-6">{t('quantityAvailable')}: <span className="font-semibold">{product.quantity} {product.unit}</span></p>

                    <div className="border-t dark:border-gray-700 pt-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                         <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">{t('projectInformation')}</h3>
                         <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            <p><span className="font-medium text-gray-800 dark:text-gray-100">{t('projectName')}:</span> {project.name}</p>
                            <p><span className="font-medium text-gray-800 dark:text-gray-100">{t('cropType')}:</span> {project.cropType}</p>
                            <p><span className="font-medium text-gray-800 dark:text-gray-100">{t('harvestDate')}:</span> {formatDate(project.endDate, lang)}</p>
                         </div>
                    </div>
                    
                    <div className="mt-6 flex items-center space-x-4">
                        <div className="flex items-center border dark:border-gray-600 rounded-md">
                            <button onClick={() => handleQuantityChange(-1)} className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-md"><Minus size={16}/></button>
                            <span className="px-4 font-semibold text-lg">{quantity}</span>
                            <button onClick={() => handleQuantityChange(1)} className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-md"><Plus size={16}/></button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdded}
                            className={`w-full py-3 rounded-md font-semibold transition duration-150 ${
                                isAdded 
                                ? 'bg-green-500 text-white' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {isAdded ? t('addedToCart') : t('addToCart')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;