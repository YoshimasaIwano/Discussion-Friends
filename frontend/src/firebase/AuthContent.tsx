import React, { createContext, useContext, useEffect, useState } from "react";
import { firebase } from "./firebase";

interface AuthContextType {
  user: firebase.User | null;
  initializing: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  initializing: true,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing }}>
      {children}
    </AuthContext.Provider>
  );
};
