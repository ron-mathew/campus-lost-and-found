import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAccounts } from "../context/AccountContext";
import { io } from "socket.io-client";
import api from "../utils/api";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");

export default function Navbar() {
    const { user, logout } = useAuth();
    const { accounts, switchAccount, removeAccount } = useAccounts();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [unreadMsg, setUnreadMsg] = useState(0);
    const [unreadNotif, setUnreadNotif] = useState(0);
    const menuRef = useRef();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (!user) return;

        socket.emit("user_join", user._id);

        const fetchCounts = () => {
            api.get("/chats/unread").then(r => setUnreadMsg(r.data.count)).catch(() => { });
            api.get("/notifications/unread").then(r => setUnreadNotif(r.data.count)).catch(() => { });
        };
        fetchCounts();
        const interval = setInterval(fetchCounts, 15000);

        // Real-time notification
        socket.on("new_notification", () => setUnreadNotif(prev => prev + 1));

        return () => {
            clearInterval(interval);
            socket.off("new_notification");
        };
    }, [user]);

    // Reset counts when visiting those pages
    useEffect(() => {
        if (location.pathname === "/notifications") setUnreadNotif(0);
        if (location.pathname.startsWith("/messages")) setUnreadMsg(0);
    }, [location.pathname]);

    const handleLogout = () => { logout(); navigate("/login"); setMenuOpen(false); };
    const handleSwitch = (id) => { switchAccount(id); setMenuOpen(false); navigate("/"); };
    const handleRemove = (e, id) => { e.stopPropagation(); removeAccount(id); };
    const isActive = (path) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
    const otherAccounts = accounts.filter(a => a._id !== user?._id);

    const NavLink = ({ to, children, badge }) => (
        <Link to={to} style={{
            padding: "7px 14px", borderRadius: "var(--radius-sm)", fontSize: 14,
            fontWeight: isActive(to) ? 500 : 400,
            color: isActive(to) ? "var(--accent)" : "var(--text-muted)",
            background: isActive(to) ? "var(--accent-light)" : "transparent",
            transition: "var(--transition)", display: "flex", alignItems: "center", gap: 6,
        }}>
            {children}
            {badge > 0 && (
                <span style={{ background: "var(--accent)", color: "white", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, minWidth: 18, textAlign: "center" }}>
                    {badge > 9 ? "9+" : badge}
                </span>
            )}
        </Link>
    );

    return (
        <nav style={{
            position: "sticky", top: 0, zIndex: 100,
            background: scrolled ? "rgba(247,245,240,0.92)" : "var(--bg)",
            backdropFilter: scrolled ? "blur(12px)" : "none",
            borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
            transition: "all 0.3s ease", padding: "0 24px",
        }}>
            <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
                <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                    </div>
                    <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "var(--text)" }}>
                        Lost<span style={{ color: "var(--accent)" }}>&</span>Found
                    </span>
                </Link>

                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {user ? (
                        <>
                            <NavLink to="/report">Report Item</NavLink>
                            <NavLink to="/my-items">My Items</NavLink>
                            <NavLink to="/my-claims">My Claims</NavLink>
                            <NavLink to="/messages" badge={unreadMsg}>Messages</NavLink>
                            <NavLink to="/notifications" badge={unreadNotif}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                                </svg>
                            </NavLink>

                            <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 8px" }} />

                            {/* Account dropdown */}
                            <div style={{ position: "relative" }} ref={menuRef}>
                                <button onClick={() => setMenuOpen(!menuOpen)} style={{
                                    display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                                    background: menuOpen ? "var(--bg-subtle)" : "transparent",
                                    border: "1.5px solid", borderColor: menuOpen ? "var(--border)" : "transparent",
                                    borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "var(--transition)",
                                }}>
                                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>
                                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                                    </div>
                                    <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{user.name?.split(" ")[0] || "User"}</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        style={{ transition: "transform 0.2s", transform: menuOpen ? "rotate(180deg)" : "rotate(0)" }}>
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </button>

                                {menuOpen && (
                                    <div style={{
                                        position: "absolute", right: 0, top: "calc(100% + 8px)",
                                        background: "var(--bg-card)", border: "1px solid var(--border)",
                                        borderRadius: "var(--radius)", boxShadow: "var(--shadow-lg)",
                                        minWidth: 220, overflow: "hidden", zIndex: 200,
                                        animation: "fadeUp 0.15s ease both",
                                    }}>
                                        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                                            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-light)", marginBottom: 6 }}>Signed in as</p>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>
                                                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: 14, fontWeight: 500 }}>{user.name}</p>
                                                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{user.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Link to="/profile" onClick={() => setMenuOpen(false)}><MenuItem icon="👤" label="Profile" /></Link>

                                        {otherAccounts.length > 0 && (
                                            <>
                                                <div style={{ padding: "8px 16px 4px", borderTop: "1px solid var(--border)" }}>
                                                    <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-light)" }}>Switch account</p>
                                                </div>
                                                {otherAccounts.map(acc => (
                                                    <div key={acc._id} onClick={() => handleSwitch(acc._id)} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                                                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
                                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-subtle)", border: "1.5px solid var(--border)", color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                                                            {acc.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <p style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{acc.name}</p>
                                                            <p style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{acc.email}</p>
                                                        </div>
                                                        <button onClick={(e) => handleRemove(e, acc._id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 6px", color: "var(--text-light)", fontSize: 16, borderRadius: 4 }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-light)"; }}>✕</button>
                                                    </div>
                                                ))}
                                            </>
                                        )}

                                        <div style={{ borderTop: "1px solid var(--border)" }}>
                                            <Link to="/login" onClick={() => setMenuOpen(false)}><MenuItem icon="＋" label="Add account" /></Link>
                                        </div>
                                        <div style={{ borderTop: "1px solid var(--border)" }}>
                                            <div onClick={handleLogout} style={{ padding: "12px 16px", fontSize: 14, color: "var(--accent)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                                                onMouseEnter={e => e.currentTarget.style.background = "var(--accent-light)"}
                                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                                Sign out
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {accounts.length > 0 && (
                                <div style={{ position: "relative" }} ref={menuRef}>
                                    <button onClick={() => setMenuOpen(!menuOpen)} className="btn-outline" style={{ fontSize: 13, padding: "7px 14px", marginRight: 6 }}>Switch account</button>
                                    {menuOpen && (
                                        <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-lg)", minWidth: 220, overflow: "hidden", zIndex: 200 }}>
                                            {accounts.map(acc => (
                                                <div key={acc._id} onClick={() => handleSwitch(acc._id)} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                                                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
                                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>
                                                        {acc.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontSize: 13, fontWeight: 500 }}>{acc.name}</p>
                                                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{acc.email}</p>
                                                    </div>
                                                    <button onClick={(e) => handleRemove(e, acc._id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 6px", color: "var(--text-light)", fontSize: 16 }}
                                                        onMouseEnter={e => e.currentTarget.style.color = "#dc2626"}
                                                        onMouseLeave={e => e.currentTarget.style.color = "var(--text-light)"}>✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <Link to="/login" style={{ padding: "7px 14px", fontSize: 14, color: "var(--text-muted)" }}>Sign in</Link>
                            <Link to="/register"><button className="btn-primary" style={{ padding: "8px 18px", fontSize: 14 }}>Get started</button></Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

const MenuItem = ({ icon, label }) => (
    <div style={{ padding: "12px 16px", fontSize: 14, color: "var(--text)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <span style={{ fontSize: 16 }}>{icon}</span> {label}
    </div>
);
