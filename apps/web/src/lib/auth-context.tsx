'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/mutations/auth.mutations';
import { ME_QUERY } from '../graphql/queries/user.queries';

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
  plan: string;
}

interface MeData {
  me: User | null;
}

interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface LoginData {
  login: AuthData;
}

interface RegisterData {
  register: AuthData;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  const [loginMutation] = useMutation<LoginData>(LOGIN_MUTATION);
  const [registerMutation] = useMutation<RegisterData>(REGISTER_MUTATION);

  useEffect(() => {
    const token = localStorage.getItem('momentee_access_token');
    if (token) {
      setHasToken(true);
    } else {
      setLoading(false);
    }
  }, []);

  const { data: meData, loading: meLoading } = useQuery<MeData>(ME_QUERY, {
    skip: !hasToken,
  });

  useEffect(() => {
    if (!hasToken) return;
    if (meData?.me) {
      setUser(meData.me);
      setLoading(false);
    } else if (!meLoading) {
      setLoading(false);
    }
  }, [hasToken, meData, meLoading]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await loginMutation({
        variables: { input: { email, password } },
      });

      if (data?.login) {
        localStorage.setItem('momentee_access_token', data.login.accessToken);
        localStorage.setItem('momentee_refresh_token', data.login.refreshToken);
        setUser(data.login.user);
      }
    },
    [loginMutation],
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const { data } = await registerMutation({
        variables: { input: { email, password, name } },
      });

      if (data?.register) {
        localStorage.setItem('momentee_access_token', data.register.accessToken);
        localStorage.setItem('momentee_refresh_token', data.register.refreshToken);
        setUser(data.register.user);
      }
    },
    [registerMutation],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('momentee_access_token');
    localStorage.removeItem('momentee_refresh_token');
    setUser(null);
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
