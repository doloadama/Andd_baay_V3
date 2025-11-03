import { User } from '../types';
import { apiFetch } from './api';

export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const data = await apiFetch('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data && data.access) {
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Login failed:", error);
    return false;
  }
};

export const register = async (userData: Omit<User, 'id'> & { password?: string }): Promise<boolean> => {
    try {
        const response = await apiFetch('/auth/register/', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        
        // After successful registration, log the user in to get tokens
        if (response) {
            return await login(userData.email, userData.password!);
        }
        return false;
    } catch (error) {
        console.error("Registration failed:", error);
        return false;
    }
};

export const logout = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Optionally, redirect to login page
  window.location.reload();
};

export const getProfile = async (): Promise<User | null> => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  
  try {
    const user = await apiFetch('/auth/profile/');
    return user;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    // If profile fails (e.g., token expired), log out
    logout();
    return null;
  }
};


export const updateProfile = async (userData: User): Promise<User | null> => {
    try {
        const updatedUser = await apiFetch('/auth/profile/', {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
        return updatedUser;
    } catch (error) {
        console.error("Failed to update profile:", error);
        return null;
    }
}
