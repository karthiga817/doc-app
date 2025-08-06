import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) throw error;

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          role: data.role,
          createdAt: data.created_at
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, expectedRole?: string): Promise<boolean> => {
    try {
      // Handle demo logins
      if (email === 'admin@medbook.com' && password === 'admin123') {
        const demoAdmin = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'admin@medbook.com',
          name: 'System Administrator',
          phone: '+1-555-0100',
          role: 'admin' as const,
          createdAt: new Date().toISOString()
        };
        setUser(demoAdmin);
        return true;
      }
      
      if (email === 'doctor@medbook.com' && password === 'doctor123') {
        const demoDoctor = {
          id: '00000000-0000-0000-0000-000000000002',
          email: 'doctor@medbook.com',
          name: 'Dr. John Smith',
          phone: '+1-555-0200',
          role: 'doctor' as const,
          createdAt: new Date().toISOString()
        };
        setUser(demoDoctor);
        return true;
      }
      
      if (email === 'patient@medbook.com' && password === 'patient123') {
        const demoPatient = {
          id: '00000000-0000-0000-0000-000000000003',
          email: 'patient@medbook.com',
          name: 'Jane Doe',
          phone: '+1-555-0300',
          role: 'patient' as const,
          createdAt: new Date().toISOString()
        };
        setUser(demoPatient);
        return true;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user && expectedRole) {
        // Fetch user profile to check role
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (userError || !userData || userData.role !== expectedRole) {
          await supabase.auth.signOut();
          return false;
        }
      }

      return !!data.user;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: userData.email,
            name: userData.name,
            phone: userData.phone,
            role: userData.role || 'patient'
          });

        if (profileError) throw profileError;

        // If patient, create patient record
        if (userData.role === 'patient' || !userData.role) {
          const { error: patientError } = await supabase
            .from('patients')
            .insert({
              user_id: authData.user.id,
              date_of_birth: userData.dateOfBirth,
              address: userData.address
            });

          if (patientError) throw patientError;
        }

        // If doctor, create doctor record
        if (userData.role === 'doctor') {
          const { error: doctorError } = await supabase
            .from('doctors')
            .insert({
              user_id: authData.user.id,
              specialization: userData.specialization,
              experience: userData.experience || 0,
              availability: userData.availability || [],
              is_active: true
            });

          if (doctorError) throw doctorError;
        }

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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      return false;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
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