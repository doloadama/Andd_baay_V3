import React, { useState } from 'react';
import * as authService from '../services/authService';
import { User, Role } from '../types';
import { MALI_REGIONS } from '../constants';
import { Language } from '../utils/i18n';

interface AuthModalProps {
    show: boolean;
    onClose: () => void;
    onLoginSuccess: (user: User) => void;
    t: (key: any, options?: any) => string;
    lang: Language;
}

const AuthModal: React.FC<AuthModalProps> = ({ show, onClose, onLoginSuccess, t, lang }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [regData, setRegData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        location: MALI_REGIONS[0],
        role: Role.FARMER,
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const success = await authService.login(email, password);
        if (success) {
            const user = await authService.getProfile();
            if (user) {
                onLoginSuccess(user);
            } else {
                setError(t('invalidCredentials'));
            }
        } else {
            setError(t('invalidCredentials'));
        }
        setLoading(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (regData.password !== regData.confirmPassword) {
            setError(t('passwordsNoMatch'));
            return;
        }
        setError('');
        setLoading(true);
        const { name, email, phone, location, role } = regData;
        const success = await authService.register({ name, email, phone, location, role });
        if (success) {
             const user = await authService.getProfile();
             if (user) {
                onLoginSuccess(user);
            } else {
                setError(t('registerSuccessLoginFailed'));
            }
        } else {
            setError(t('registerFailed'));
        }
        setLoading(false);
    };

    const handleRegChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setRegData({ ...regData, [e.target.name]: e.target.value });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-gray-100">{isLoginView ? t('login') : t('createAccount')}</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                
                {isLoginView ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input type="email" placeholder={t('emailAddress')} value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                        <input type="password" placeholder={t('password')} value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                        <button type="submit" disabled={loading} className="w-full p-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 disabled:bg-green-300">
                            {loading ? t('loggingIn') : t('login')}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-3">
                         <input type="text" name="name" placeholder={t('fullName')} value={regData.name} onChange={handleRegChange} required className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                         <input type="email" name="email" placeholder={t('emailAddress')} value={regData.email} onChange={handleRegChange} required className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                         <input type="password" name="password" placeholder={t('password')} value={regData.password} onChange={handleRegChange} required className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                         <input type="password" name="confirmPassword" placeholder={t('confirmPassword')} value={regData.confirmPassword} onChange={handleRegChange} required className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                         <input type="tel" name="phone" placeholder={t('phoneNumber')} value={regData.phone} onChange={handleRegChange} required className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                         <select name="location" value={regData.location} onChange={handleRegChange} className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                            {MALI_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                         </select>
                         <select name="role" value={regData.role} onChange={handleRegChange} className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                            <option value={Role.FARMER}>{t('farmer')}</option>
                            <option value={Role.SELLER}>{t('seller')}</option>
                            <option value={Role.BOTH}>{t('both')}</option>
                         </select>
                        <button type="submit" disabled={loading} className="w-full p-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 disabled:bg-green-300">
                            {loading ? t('registering') : 'Register'}
                        </button>
                    </form>
                )}

                <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
                    {isLoginView ? t('noAccount') : t('haveAccount')}
                    <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="text-blue-600 hover:underline ml-1 font-semibold">
                        {isLoginView ? t('signUp') : t('logIn')}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthModal;