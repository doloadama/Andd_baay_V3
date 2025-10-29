import { User, Role } from '../types';
import { USERS } from '../constants'; // Using mock data for now

// In a real app, this would be an API endpoint
const API_URL = '/api/auth'; 

// --- MOCK API ---
// This section simulates a backend API for demonstration purposes.
// It uses localStorage to persist the session token.

const mockApi = {
  login: async (email: string, password: string): Promise<{ access: string; refresh: string } | null> => {
    const user = USERS.find(u => u.email === email);
    // In a real app, you'd verify the password hash
    if (user && password === 'password123') { 
      const token = `mock-jwt-token-for-${user.id}`;
      return { access: token, refresh: 'mock-refresh-token' };
    }
    return null;
  },
  register: async (userData: Omit<User, 'id'>): Promise<{ access: string; refresh: string } | null> => {
    if (USERS.some(u => u.email === userData.email)) {
      return null; // Email already exists
    }
    const newUser: User = { id: Math.max(...USERS.map(u => u.id), 0) + 1, ...userData };
    
    // FIX: This line was commented out, preventing new users from being added.
    USERS.push(newUser);
    
    console.log("Mock Register:", newUser);
    // Automatically log in after registration
    return mockApi.login(userData.email, 'password123');
  },
  getProfile: async (token: string): Promise<User | null> => {
    if (!token.startsWith('mock-jwt-token-for-')) return null;
    const userId = parseInt(token.replace('mock-jwt-token-for-', ''));
    const userFromDb = USERS.find(u => u.id === userId);

    if (userFromDb) {
      // SIMULATE BACKEND: The Django backend model has `first_name` and `last_name`.
      // The serializer combines them into a single `name` field for the frontend.
      // We simulate this logic for consistency, ensuring correct formatting.
      const nameParts = userFromDb.name.split(' ');
      const firstName = nameParts.shift() || '';
      const lastName = nameParts.join(' ');
      
      const userForFrontend: User = {
        ...userFromDb,
        name: `${firstName} ${lastName}`.trim(),
      };
      return userForFrontend;
    }
    return null;
  },
  updateProfile: async (token: string, userData: User): Promise<User | null> => {
     if (!token.startsWith('mock-jwt-token-for-')) return null;
     const userId = parseInt(token.replace('mock-jwt-token-for-', ''));
     const userIndex = USERS.findIndex(u => u.id === userId);
     
     if (userIndex > -1) {
        // SIMULATE BACKEND: The Django backend serializer receives a `name` field
        // and splits it to update `first_name` and `last_name` in the database.
        // We will update our mock 'database' (the USERS array) accordingly.
        const nameParts = userData.name.split(' ');
        const firstName = nameParts.shift() || '';
        const lastName = nameParts.join(' ');
        
        const updatedUser = {
          ...USERS[userIndex],
          name: `${firstName} ${lastName}`.trim(),
          phone: userData.phone,
          location: userData.location,
        };
        
        USERS[userIndex] = updatedUser;
        
        // Return the updated user object, as a real API does.
        return { ...updatedUser };
     }
     return null;
  }
};

// --- AUTH SERVICE ---

export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const data = await mockApi.login(email, password);
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

export const register = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    try {
        const data = await mockApi.register(userData);
        if (data && data.access) {
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            return true;
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
};

export const getProfile = async (): Promise<User | null> => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  
  try {
    // Here you might also refresh the token if it's expired
    const user = await mockApi.getProfile(token);
    return user;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    logout(); // Log out if profile fetch fails
    return null;
  }
};


export const updateProfile = async (userData: User): Promise<User | null> => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
        const updatedUser = await mockApi.updateProfile(token, userData);
        return updatedUser;
    } catch (error) {
        console.error("Failed to update profile:", error);
        return null;
    }
}