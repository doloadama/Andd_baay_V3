import React, { useState } from 'react';
import { login, register } from '../services/authService';
import { Role, User } from '../types';
import { X, Sprout } from 'lucide-react';
import { MALI_REGIONS } from '../constants';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Login State
    const [loginEmail, setLoginEmail] = useState('awa@agribusiness.com');
    const [loginPassword, setLoginPassword] = useState('password123');
    
    // Register State
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        location: MALI_REGIONS[0],
        role: Role.FARMER,
    });

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const success = await login(loginEmail, loginPassword);
        if (success) {
            onLoginSuccess();
        } else {
            setError('Invalid email or password.');
        }
        setIsLoading(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (registerData.password !== registerData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setIsLoading(true);
        setError('');
        const userData: Omit<User, 'id'> = {
            name: registerData.name,
            email: registerData.email,
            phone: registerData.phone,
            location: registerData.location,
            role: registerData.role,
        };
        const success = await register(userData);
        if (success) {
             // After successful registration, log them in with the same credentials
            const loginSuccess = await login(registerData.email, registerData.password);
            if(loginSuccess) {
                onLoginSuccess();
            } else {
                setError('Registration successful, but auto-login failed. Please log in manually.');
            }
        } else {
            setError('Registration failed. The email might already be in use.');
        }
        setIsLoading(false);
    };

    if (!isOpen) return null;
    
    const InputField = ({...props}) => <input {...props} className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-stone-50" />
    const SelectField = ({...props}) => <select {...props} className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white" />
    const SubmitButton = ({ disabled, children }: { disabled: boolean, children: React.ReactNode }) => (
        <button 
            type="submit" 
            disabled={disabled} 
            className="w-full py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold disabled:opacity-50 hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md"
        >
            {children}
        </button>
    )


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors">
                    <X size={24} />
                </button>
                <div className="p-8 space-y-6">
                    <div className="text-center">
                        <Sprout className="mx-auto text-emerald-600" size={40} />
                        <h2 className="mt-4 text-2xl font-bold text-gray-800">Welcome to Andd Baay</h2>
                        <p className="text-sm text-gray-500">Your digital farming companion</p>
                    </div>

                    <div className="flex border-b border-stone-200">
                        <button onClick={() => {setIsLoginView(true); setError('')}} className={`flex-1 py-3 text-sm font-semibold transition-colors ${isLoginView ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500 hover:text-gray-800'}`}>Login</button>
                        <button onClick={() => {setIsLoginView(false); setError('')}} className={`flex-1 py-3 text-sm font-semibold transition-colors ${!isLoginView ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500 hover:text-gray-800'}`}>Register</button>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">{error}</p>}
                    
                    {isLoginView ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <InputField type="email" placeholder="Email (e.g. awa@agribusiness.com)" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                            <InputField type="password" placeholder="Password (password123)" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                            <SubmitButton disabled={isLoading}>{isLoading ? 'Logging in...' : 'Login'}</SubmitButton>
                        </form>
                    ) : (
                         <form onSubmit={handleRegister} className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                             <InputField name="name" type="text" placeholder="Full Name" value={registerData.name} onChange={handleRegisterChange} required />
                             <InputField name="email" type="email" placeholder="Email Address" value={registerData.email} onChange={handleRegisterChange} required />
                             <InputField name="phone" type="tel" placeholder="Phone Number" value={registerData.phone} onChange={handleRegisterChange} required />
                             <InputField name="password" type="password" placeholder="Password" value={registerData.password} onChange={handleRegisterChange} required />
                             <InputField name="confirmPassword" type="password" placeholder="Confirm Password" value={registerData.confirmPassword} onChange={handleRegisterChange} required />
                             <SelectField name="location" value={registerData.location} onChange={handleRegisterChange}>
                                 {MALI_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                             </SelectField>
                             <SelectField name="role" value={registerData.role} onChange={handleRegisterChange}>
                                 {Object.values(Role).map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                             </SelectField>
                            <SubmitButton disabled={isLoading}>{isLoading ? 'Creating Account...' : 'Register'}</SubmitButton>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;