"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define a simple user type
type User = { id: string; name: string; email: string } | null;

interface AuthContextType {
    user: User;
    login: (name: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User>(null);

    const login = (name: string) => {
        setUser({ id: '1', name, email: `${name.toLowerCase()}@example.com` });
    };

    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};