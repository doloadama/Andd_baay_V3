import React, { useState } from 'react';
import * as authService from '../services/authService';
import { User, Role } from '../types';
import { MALI_REGIONS } from '../constants';
import { t, Language } from '../utils/i1n';

interface AuthModalProps {
    show: boolean;
    onClose: () => void;
    onLoginSuccess: (user: User) => void;
    t: (key: any, lang: Language) => string;
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
                setError(t('invalidCredentials', lang));
            }
        } else {
            setError(t('invalidCredentials', lang));
        }
        setLoading(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (regData.password !== regData.confirmPassword) {
            setError(t('passwordsNoMatch', lang));
            return;
        }
        setError('');
        setLoading(true);
        // Fix: The authService.register function expects an object matching `Omit<User, 'id'>`, which does not include a `password` property.
        // The mock service hardcodes the password for new users, so we should not pass it from the form.
        const { name, email, phone, location, role } = regData;
        const success = await authService.register({ name, email, phone, location, role });
        if (success) {
             const user = await authService.getProfile();
             if (user) {
                onLoginSuccess(user);
            } else {
                setError(t('registerSuccessLoginFailed', lang));
            }
        } else {
            setError(t('registerFailed', lang));
        }
        setLoading(false);
    };

    const handleRegChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setRegData({ ...regData, [e.target.name]: e.target.value });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-4">{isLoginView ? t('login', lang) : t('createAccount', lang)}</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                
                {isLoginView ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input type="email" placeholder={t('emailAddress', lang)} value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 border rounded-md" />
                        <input type="password" placeholder={t('password', lang)} value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 border rounded-md" />
                        <button type="submit" disabled={loading} className="w-full p-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 disabled:bg-green-300">
                            {loading ? t('loggingIn', lang) : t('login', lang)}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-3">
                         <input type="text" name="name" placeholder={t('fullName', lang)} value={regData.name} onChange={handleRegChange} required className="w-full p-2 border rounded-md" />
                         <input type="email" name="email" placeholder={t('emailAddress', lang)} value={regData.email} onChange={handleRegChange} required className="w-full p-2 border rounded-md" />
                         <input type="password" name="password" placeholder={t('password', lang)} value={regData.password} onChange={handleRegChange} required className="w-full p-2 border rounded-md" />
                         <input type="password" name="confirmPassword" placeholder={t('confirmPassword', lang)} value={regData.confirmPassword} onChange={handleRegChange} required className="w-full p-2 border rounded-md" />
                         <input type="tel" name="phone" placeholder={t('phoneNumber', lang)} value={regData.phone} onChange={handleRegChange} required className="w-full p-2 border rounded-md" />
                         <select name="location" value={regData.location} onChange={handleRegChange} className="w-full p-2 border rounded-md">
                            {MALI_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                         </select>
                         <select name="role" value={regData.role} onChange={handleRegChange} className="w-full p-2 border rounded-md">
                            <option value={Role.FARMER}>{t('farmer', lang)}</option>
                            <option value={Role.SELLER}>{t('seller', lang)}</option>
                            <option value={Role.BOTH}>{t('both', lang)}</option>
                         </select>
                        <button type="submit" disabled={loading} className="w-full p-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 disabled:bg-green-300">
                            {loading ? t('registering', lang) : 'Register'}
                        </button>
                    </form>
                )}

                <p className="text-center mt-6">
                    {isLoginView ? t('noAccount', lang) : t('haveAccount', lang)}
                    <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="text-blue-600 hover:underline ml-1 font-semibold">
                        {isLoginView ? t('signUp', lang) : t('logIn', lang)}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthModal;