import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const savedUser = () => {
  try { return JSON.parse(localStorage.getItem('socialconnect-user') || 'null'); }
  catch { return null; }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(savedUser);
  function signIn(token, nextUser) {
    localStorage.setItem('socialconnect-token', token);
    localStorage.setItem('socialconnect-user', JSON.stringify(nextUser));
    setUser(nextUser);
  }
  function updateUser(nextUser) {
    localStorage.setItem('socialconnect-user', JSON.stringify(nextUser));
    setUser(nextUser);
  }
  function signOut() {
    localStorage.removeItem('socialconnect-token');
    localStorage.removeItem('socialconnect-user');
    setUser(null);
  }
  return <AuthContext.Provider value={{ user, signIn, signOut, updateUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}