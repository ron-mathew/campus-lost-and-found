import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { timeAgo } from "../utils/timeAgo";
import { useToast } from "../context/ToastContext";

const typeIcon = {
    claim_submitted: "📋",
    claim_approved: "✅",
    claim_rejected: "❌",
    item_returned: "🏠",
    new_message: "💬",
};

const typeColor = {
    claim_submitted: "var(--accent-light)",
    claim_approved: "var(--found-light)",
    claim_rejected: "#fee2e2",
    item_returned: "var(--found-light)",
    new_message: "#e0f2fe",
};

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/notifications").then(r => {
            setNotifications(r.data);
            setLoading(false);
        });
        // Mark all as read after opening
        api.put("/notifications/read-all").catch(() => { });
    }, []);

    const handleClick = async (notif) => {
        if (!notif.read) {
            await api.put(`/notifications/${notif._id}/read`);
            setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
        }
        if (notif.link) navigate(notif.link);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        await api.delete(`/notifications/${id}`);
        setNotifications(prev => prev.filter(n => n._id !== id));
        addToast("Notification removed");
    };

    const handleClearAll = async () => {
        await Promise.all(notifications.map(n => api.delete(`/notifications/${n._id}`)));
        setNotifications([]);
        addToast("All notifications cleared");
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, maxWidth: 680 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 32, marginBottom: 4 }}>Notifications</h1>
                    <p style={{ color: "var(--text-muted)" }}>
                        {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                    </p>
                </div>
                {notifications.length > 0 && (
                    <button className="btn-ghost" style={{ fontSize: 13 }} onClick={handleClearAll}>
                        Clear all
                    </button>
                )}
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} style={{ height: 72, borderRadius: "var(--radius)", background: "var(--bg-card)", border: "1px solid var(--border)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%", backgroundImage: "linear-gradient(90deg,var(--bg-subtle) 25%,var(--border) 50%,var(--bg-subtle) 75%)" }} />
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <div className="card" style={{ padding: 48, textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
                    <h3 style={{ fontSize: 20, marginBottom: 8 }}>No notifications</h3>
                    <p style={{ color: "var(--text-muted)" }}>You're all caught up! Notifications will appear here when something happens.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {notifications.map(notif => (
                        <div key={notif._id} onClick={() => handleClick(notif)} style={{
                            display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px",
                            background: notif.read ? "var(--bg-card)" : typeColor[notif.type] || "var(--accent-light)",
                            border: `1px solid ${notif.read ? "var(--border)" : "transparent"}`,
                            borderRadius: "var(--radius)", cursor: notif.link ? "pointer" : "default",
                            transition: "var(--transition)", position: "relative",
                        }}
                            onMouseEnter={e => { if (notif.link) e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                        >
                            {/* Unread dot */}
                            {!notif.read && (
                                <div style={{ position: "absolute", top: 16, right: 16, width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
                            )}

                            {/* Icon */}
                            <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>
                                {typeIcon[notif.type] || "🔔"}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 4, fontWeight: notif.read ? 400 : 500 }}>
                                    {notif.message}
                                </p>
                                <p style={{ fontSize: 12, color: "var(--text-light)" }}>{timeAgo(notif.createdAt)}</p>
                            </div>

                            {/* Delete */}
                            <button onClick={(e) => handleDelete(e, notif._id)} style={{
                                background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
                                color: "var(--text-light)", fontSize: 16, borderRadius: 4, flexShrink: 0,
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-light)"; }}>
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        </div>
    );
}
