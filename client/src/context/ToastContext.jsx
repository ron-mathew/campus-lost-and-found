import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "success") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
                {toasts.map(toast => (
                    <div key={toast.id} onClick={() => removeToast(toast.id)} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "13px 18px", borderRadius: "var(--radius-sm)",
                        background: toast.type === "success" ? "var(--text)" : toast.type === "error" ? "#dc2626" : "#0369a1",
                        color: "white", fontSize: 14, fontWeight: 500,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                        cursor: "pointer", minWidth: 260, maxWidth: 380,
                        animation: "slideIn 0.3s cubic-bezier(0.4,0,0.2,1)",
                    }}>
                        <span style={{ fontSize: 16 }}>
                            {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}
                        </span>
                        <span style={{ flex: 1 }}>{toast.message}</span>
                    </div>
                ))}
            </div>
            <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
