"use client";
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext({ user: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState(null);
    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
};