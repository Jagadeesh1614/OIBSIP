import { createContext, useContext, useState } from 'react';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_info')) || null; } catch { return null; }
  });

  const login = (t, a) => {
    setToken(t); setAdmin(a);
    localStorage.setItem('admin_token', t);
    localStorage.setItem('admin_info', JSON.stringify(a));
  };
  const logout = () => {
    setToken(''); setAdmin(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
  };

  return <AdminAuthContext.Provider value={{ token, admin, login, logout }}>{children}</AdminAuthContext.Provider>;
}

export const useAdminAuth = () => useContext(AdminAuthContext);
