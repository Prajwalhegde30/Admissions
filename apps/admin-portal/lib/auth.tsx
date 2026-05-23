'use client';

import { createContext, useContext, ReactNode } from 'react';

const MOCK_ADMIN = {
  id: 'mock-admin',
  email: 'admin@atria.ac.in',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  mustChangePassword: false,
};

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  mustChangePassword: boolean;
}

interface AuthContextType {
  user: User;
  isAuthenticated: true;
  isLoading: false;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (data: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: MOCK_ADMIN,
  isAuthenticated: true,
  isLoading: false,
  login: async () => {},
  logout: async () => {},
  setSession: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: MOCK_ADMIN,
        isAuthenticated: true,
        isLoading: false,
        login: async () => {},
        logout: async () => {},
        setSession: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
