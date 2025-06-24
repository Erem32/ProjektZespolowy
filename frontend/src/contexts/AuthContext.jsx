import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  // wczytanie z localStorage tylko raz
  const [user, setUser] = useState(() => {
    const id = localStorage.getItem('userId');
    const email = localStorage.getItem('username');
    return id ? { id: Number(id), email } : null;
  });

  // logowanie
  const login = ({ id, email }) => {
    localStorage.setItem('userId', id);
    localStorage.setItem('username', email);
    setUser({ id, email });
  };

  // wylogowanie
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  // synchronizacja kart/przeglądarek
  useEffect(() => {
    const sync = () => {
      const id = localStorage.getItem('userId');
      const email = localStorage.getItem('username');
      setUser(id ? { id: Number(id), email } : null);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuth: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
