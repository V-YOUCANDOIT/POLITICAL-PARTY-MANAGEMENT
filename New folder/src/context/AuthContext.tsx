import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { apiRequest } from '../lib/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  quickSwitchUser: (email: string) => Promise<void>;
  logout: () => void;
  demoUsers: { id: string; email: string; full_name: string; role: UserRole }[];
  canManageFinances: boolean;
  canManageUsers: boolean;
  canManageCampaigns: boolean;
  canManageUnits: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('politix_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState<any[]>([]);

  // Fetch demo users for developer role switcher
  useEffect(() => {
    apiRequest('/api/auth/demo-users')
      .then(data => {
        if (data.users) setDemoUsers(data.users);
      })
      .catch(err => console.error('Failed to load demo accounts:', err));
  }, []);

  // Fetch current user if token exists
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await apiRequest('/api/auth/me');
        setUser(data.user);
      } catch (err) {
        console.warn('Session expired or invalid token:', err);
        localStorage.removeItem('politix_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string = 'politix2026') => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('politix_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const quickSwitchUser = async (email: string) => {
    await login(email, 'politix2026');
  };

  const logout = () => {
    localStorage.removeItem('politix_token');
    setToken(null);
    setUser(null);
  };

  const role = user?.role;
  const isSuperAdmin = role === 'Super Administrator';
  const isCentralAdmin = role === 'Central Administrator' || isSuperAdmin;
  const canManageFinances = isCentralAdmin;
  const canManageUsers = isCentralAdmin || role === 'State Coordinator';
  const canManageCampaigns = isCentralAdmin || role === 'State Coordinator' || role === 'Campaign Manager';
  const canManageUnits = isCentralAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        quickSwitchUser,
        logout,
        demoUsers,
        canManageFinances,
        canManageUsers,
        canManageCampaigns,
        canManageUnits,
        isSuperAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
