import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AccountProvider } from "./context/AccountContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ItemDetail from "./pages/ItemDetail";
import ReportItem from "./pages/ReportItem";
import EditItem from "./pages/EditItem";
import MyItems from "./pages/MyItems";
import MyClaims from "./pages/MyClaims";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Navbar from "./components/Navbar";

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

export default function App() {
    return (
        <AccountProvider>
            <AuthProvider>
                <ToastProvider>
                    <BrowserRouter>
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/items/:id" element={<ItemDetail />} />
                            <Route path="/report" element={<PrivateRoute><ReportItem /></PrivateRoute>} />
                            <Route path="/edit/:id" element={<PrivateRoute><EditItem /></PrivateRoute>} />
                            <Route path="/my-items" element={<PrivateRoute><MyItems /></PrivateRoute>} />
                            <Route path="/my-claims" element={<PrivateRoute><MyClaims /></PrivateRoute>} />
                            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                            <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
                            <Route path="/messages/:chatId" element={<PrivateRoute><Messages /></PrivateRoute>} />
                            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                        </Routes>
                    </BrowserRouter>
                </ToastProvider>
            </AuthProvider>
        </AccountProvider>
    );
}
