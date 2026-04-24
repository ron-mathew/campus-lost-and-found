import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAccounts } from "../context/AccountContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";
import { timeAgo } from "../utils/timeAgo";

export default function Profile() {
    const { user, logout } = useAuth();
    const { logoutAll } = useAccounts();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const load = async () => {
            const [itemsRes, claimsRes] = await Promise.all([api.get("/items"), api.get("/claims/my")]);
            setItems(itemsRes.data.filter(i => i.postedBy._id === user._id));
            setClaims(claimsRes.data);
            setLoading(false);
        };
        load();
    }, []);

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== user.email) {
            addToast("Email doesn't match", "error");
            return;
        }
        setDeleting(true);
        try {
            await api.delete("/auth/delete-account");
            logoutAll();
            addToast("Account deleted successfully.");
            navigate("/register");
        } catch (err) {
            addToast(err.response?.data?.message || "Failed to delete account", "error");
        } finally { setDeleting(false); }
    };

    const lostItems = items.filter(i => i.type === "lost");
    const foundItems = items.filter(i => i.type === "found");
    const returnedItems = items.filter(i => i.status === "returned");
    const approvedClaims = claims.filter(c => c.status === "approved");

    const stats = [
        { label: "Items Posted", value: items.length, icon: "📦" },
        { label: "Lost Reports", value: lostItems.length, icon: "⚠️" },
        { label: "Found Reports", value: foundItems.length, icon: "✅" },
        { label: "Items Returned", value: returnedItems.length, icon: "🏠" },
        { label: "Claims Submitted", value: claims.length, icon: "📋" },
        { label: "Claims Approved", value: approvedClaims.length, icon: "🎉" },
    ];

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>

            {/* Profile header */}
            <div className="card page-enter" style={{ padding: "32px 36px", marginBottom: 24, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontFamily: "'DM Serif Display', serif", flexShrink: 0 }}>
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: 28, marginBottom: 4 }}>{user.name}</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 8 }}>{user.email}</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span className="badge badge-open" style={{ textTransform: "capitalize" }}>{user.role}</span>
                        {user.prn && <span className="badge" style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}>PRN: {user.prn}</span>}
                    </div>
                </div>
                <button onClick={() => { logout(); navigate("/login"); }} className="btn-outline" style={{ fontSize: 13 }}>
                    Sign out
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 32 }}>
                {stats.map(({ label, value, icon }) => (
                    <div key={label} className="card" style={{ padding: "20px 20px 18px", textAlign: "center" }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                        <div style={{ fontSize: 28, fontFamily: "'DM Serif Display', serif", marginBottom: 4 }}>{loading ? "—" : value}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Recent activity */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}>
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <h2 style={{ fontSize: 20 }}>Recent items</h2>
                        <Link to="/my-items" style={{ fontSize: 13, color: "var(--accent)" }}>View all →</Link>
                    </div>
                    {loading ? <p style={{ color: "var(--text-muted)" }}>Loading...</p> :
                        items.length === 0 ? (
                            <div className="card" style={{ padding: 24, textAlign: "center" }}>
                                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No items yet</p>
                                <Link to="/report"><button className="btn-primary" style={{ marginTop: 12, fontSize: 13 }}>Report item</button></Link>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {items.slice(0, 5).map(item => (
                                    <Link key={item._id} to={`/items/${item._id}`} style={{ textDecoration: "none" }}>
                                        <div className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                                            ) : (
                                                <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--bg-subtle)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📦</div>
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontWeight: 500, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</p>
                                                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{timeAgo(item.createdAt)}</p>
                                            </div>
                                            <span className={`badge badge-${item.type}`} style={{ flexShrink: 0 }}>{item.type}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                </div>

                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <h2 style={{ fontSize: 20 }}>Recent claims</h2>
                        <Link to="/my-claims" style={{ fontSize: 13, color: "var(--accent)" }}>View all →</Link>
                    </div>
                    {loading ? <p style={{ color: "var(--text-muted)" }}>Loading...</p> :
                        claims.length === 0 ? (
                            <div className="card" style={{ padding: 24, textAlign: "center" }}>
                                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No claims yet</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {claims.slice(0, 5).map(claim => (
                                    <Link key={claim._id} to={`/items/${claim.itemId?._id}`} style={{ textDecoration: "none" }}>
                                        <div className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--bg-subtle)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📋</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontWeight: 500, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{claim.itemId?.title}</p>
                                                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{timeAgo(claim.createdAt)}</p>
                                            </div>
                                            <span className={`badge ${claim.status === "approved" ? "badge-found" : claim.status === "rejected" ? "badge-lost" : "badge-open"}`} style={{ flexShrink: 0 }}>{claim.status}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                </div>
            </div>

            {/* Danger zone */}
            <div className="card" style={{ padding: 28, border: "1.5px solid #fecaca" }}>
                <h3 style={{ fontSize: 18, color: "#dc2626", marginBottom: 6 }}>Danger zone</h3>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
                    Permanently delete your account and all associated items and claims. This cannot be undone.
                </p>
                <button className="btn-danger" style={{ fontSize: 13 }} onClick={() => setShowDeleteModal(true)}>
                    Delete my account
                </button>
            </div>

            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 24 }}>
                    <div className="card" style={{ maxWidth: 440, width: "100%", padding: 32 }}>
                        <h3 style={{ fontSize: 22, marginBottom: 8 }}>Delete account</h3>
                        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>
                            This will permanently delete your account, all your items, and all your claims. <strong>This cannot be undone.</strong>
                        </p>
                        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Type your email address to confirm:</p>
                        <p style={{ fontSize: 13, color: "var(--accent)", fontFamily: "monospace", marginBottom: 10 }}>{user.email}</p>
                        <input placeholder={user.email} value={deleteConfirm}
                            onChange={e => setDeleteConfirm(e.target.value)}
                            style={{ borderColor: deleteConfirm && deleteConfirm !== user.email ? "#dc2626" : "var(--border)" }} />
                        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                            <button className="btn-danger" disabled={deleting || deleteConfirm !== user.email}
                                onClick={handleDeleteAccount}
                                style={{ flex: 1, padding: "12px", opacity: deleteConfirm !== user.email ? 0.5 : 1 }}>
                                {deleting ? "Deleting..." : "Delete permanently"}
                            </button>
                            <button className="btn-outline" onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
                                style={{ padding: "12px 20px" }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@media(max-width:768px){.container>div{grid-template-columns:1fr!important}}`}</style>
        </div>
    );
}
