'use client';

import { createContext, useContext, ReactNode } from 'react';

/**
 * Mock user — no login required.
 */
const MOCK_USER = {
  id: 'mock-student',
  email: 'test-student@example.com',
  firstName: 'Test',
  lastName: 'Student',
  role: 'student',
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
  user: MOCK_USER,
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
        user: MOCK_USER,
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
