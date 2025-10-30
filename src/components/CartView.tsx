import React from 'react';
import { CartItem, Product, User, View } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import { formatCurrency } from '../utils/formatters';
import { Language } from '../utils/i18n';
import { ArrowLeft, Trash2, Minus, Plus } from 'lucide-react';

interface CartViewProps {
    cart: CartItem[];
    updateCartItemQuantity: (productId: number, newQuantity: number) => void;
    removeCartItem: (productId: number) => void;
    setView: (view: View) => void;
    user: User;
    t: (key: any, options?: any) => string;
    lang: Language;
}

const CartView: React.FC<CartViewProps> = ({ cart, updateCartItemQuantity, removeCartItem, setView, t, lang }) => {
    const cartDetails = cart.map(item => {
        const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
        return product ? { ...item, product } : null;
    }).filter((item): item is { productId: number; quantity: number; product: Product } => item !== null);

    const total = cartDetails.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const handleCheckout = () => {
        alert(t('checkoutMessage'));
        // In a real app, this would navigate to a checkout flow.
        setView(View.MARKETPLACE);
    };

    if (cart.length === 0) {
        return (
            <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">{t('cartIsEmpty')}</h2>
                <button
                    onClick={() => setView(View.MARKETPLACE)}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
                >
                    {t('continueShopping')}
                </button>
            </div>
        );
    }
    
    return (
        <div>
            <div className="flex items-center mb-6">
                <button onClick={() => setView(View.MARKETPLACE)} className="p-2 mr-4 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">{t('shoppingCartTitle')}</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {cartDetails.map(item => (
                            <div key={item.productId} className="flex items-center py-4 flex-wrap">
                                <img src={item.product.imageUrl} alt={item.product.productName} className="w-24 h-24 object-cover rounded-md mr-4 mb-2 sm:mb-0"/>
                                <div className="flex-grow min-w-[150px]">
                                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{item.product.productName}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.product.price)} / {item.product.unit}</p>
                                </div>
                                <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                                    <div className="flex items-center border dark:border-gray-600 rounded-md">
                                        <button onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-md"><Minus size={16}/></button>
                                        <span className="px-3 font-semibold">{item.quantity}</span>
                                        <button onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-md"><Plus size={16}/></button>
                                    </div>
                                    <p className="font-semibold w-24 text-right text-gray-800 dark:text-gray-100">{formatCurrency(item.product.price * item.quantity)}</p>
                                    <button onClick={() => removeCartItem(item.productId)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 size={20}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md sticky top-8">
                        <h3 className="text-xl font-semibold mb-4 border-b dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-100">{t('cartSummary')}</h3>
                        <div className="space-y-2 mb-4 text-gray-700 dark:text-gray-300">
                            <div className="flex justify-between">
                                <span>{t('subtotal')}</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t dark:border-gray-700 pt-2 text-gray-800 dark:text-gray-100">
                             <span>{t('total')}</span>
                             <span>{formatCurrency(total)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full mt-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition"
                        >
                            {t('proceedToCheckout')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartView;