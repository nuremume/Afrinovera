import { createContext, useContext, useState, type ReactNode } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  organizationName?: string;
  roles: string[];
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  updateUser: (user: AuthUser) => void;
  logout: () => void;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  function setSession(nextToken: string, nextUser: AuthUser) {
    setToken(nextToken);
    setUser(nextUser);
  }

  function updateUser(nextUser: AuthUser) {
    setUser(nextUser);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  const isStaff = Boolean(user?.roles.some((r) => r !== 'CLIENT'));

  return (
    <AuthContext.Provider value={{ token, user, setSession, updateUser, logout, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
