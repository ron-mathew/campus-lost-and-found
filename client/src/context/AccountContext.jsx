import React, { createContext, useContext, useState } from "react";

// Manages multiple saved accounts + active account
const AccountContext = createContext();

const STORAGE_KEY = "saved_accounts";
const ACTIVE_KEY = "active_account";

const loadAccounts = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};

const loadActive = () => {
    try { return JSON.parse(localStorage.getItem(ACTIVE_KEY) || "null"); } catch { return null; }
};

export const AccountProvider = ({ children }) => {
    const [accounts, setAccounts] = useState(loadAccounts);
    const [activeAccount, setActiveAccount] = useState(loadActive);

    const saveAccount = (userData) => {
        setAccounts(prev => {
            const exists = prev.findIndex(a => a._id === userData._id);
            const updated = exists >= 0
                ? prev.map(a => a._id === userData._id ? userData : a)
                : [...prev, userData];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
        localStorage.setItem(ACTIVE_KEY, JSON.stringify(userData));
        setActiveAccount(userData);
    };

    const switchAccount = (accountId) => {
        const account = accounts.find(a => a._id === accountId);
        if (!account) return;
        localStorage.setItem(ACTIVE_KEY, JSON.stringify(account));
        setActiveAccount(account);
    };

    const removeAccount = (accountId) => {
        setAccounts(prev => {
            const updated = prev.filter(a => a._id !== accountId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
        if (activeAccount?._id === accountId) {
            const remaining = accounts.filter(a => a._id !== accountId);
            const next = remaining[0] || null;
            localStorage.setItem(ACTIVE_KEY, JSON.stringify(next));
            setActiveAccount(next);
        }
    };

    const logoutCurrent = () => {
        const remaining = accounts.filter(a => a._id !== activeAccount?._id);
        const next = remaining[0] || null;
        localStorage.setItem(ACTIVE_KEY, JSON.stringify(next));
        setActiveAccount(next);
    };

    const logoutAll = () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ACTIVE_KEY);
        setAccounts([]);
        setActiveAccount(null);
    };

    return (
        <AccountContext.Provider value={{ accounts, activeAccount, saveAccount, switchAccount, removeAccount, logoutCurrent, logoutAll }}>
            {children}
        </AccountContext.Provider>
    );
};

export const useAccounts = () => useContext(AccountContext);
