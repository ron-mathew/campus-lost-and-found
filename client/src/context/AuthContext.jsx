import React, { createContext, useContext } from "react";
import { useAccounts } from "./AccountContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { activeAccount, saveAccount, logoutCurrent } = useAccounts();

  return (
    <AuthContext.Provider value={{
      user: activeAccount,
      login: saveAccount,
      logout: logoutCurrent,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
