import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

type Role = 'admin' | 'vendor' | 'customer';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  shopName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User, rememberMe?: boolean) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token') || sessionStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/auth/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log('Profile fetched successfully:', res.data);
          setUser(res.data);
        } catch (error: any) {
          console.error('Failed to fetch profile. Error:', error);
          if (error.response?.status === 401) {
             console.error('401 Unauthorized - token might be invalid, expired, or server restarted.', { token, response: error.response?.data });
          }
          logout();
        }
      }
      setIsLoading(false);
    };
    
    fetchProfile();
  }, [token]);

  const login = (newToken: string, newUser: User, rememberMe: boolean = true) => {
    if (rememberMe) {
      localStorage.setItem('token', newToken);
    } else {
      sessionStorage.setItem('token', newToken);
    }
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
