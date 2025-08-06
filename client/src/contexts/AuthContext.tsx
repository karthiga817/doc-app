import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'admin' | 'doctor' | 'patient';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, expectedRole?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, expectedRole?: string): Promise<boolean> => {
    try {
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data) {
        const userData = {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          phone: response.data.phone,
          role: response.data.role,
          createdAt: response.data.createdAt || new Date().toISOString()
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await apiClient.register(userData);
      
      if (response.success && response.data) {
        // Auto-login after successful registration
        const userDataForStorage = {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          phone: response.data.phone,
          role: response.data.role,
          createdAt: response.data.createdAt || new Date().toISOString()
        };
        
        setUser(userDataForStorage);
        localStorage.setItem('user', JSON.stringify(userDataForStorage));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      // For now, just return true since we're using a simple demo auth system
      // In a real app, this would send a password reset email
      console.log('Password reset requested for:', email);
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      return false;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      // For now, just return true since we're using a simple demo auth system
      // In a real app, this would verify the token and update the password
      console.log('Password reset for token:', token);
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      register,
      forgotPassword,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};