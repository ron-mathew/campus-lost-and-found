import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";
import { formatDate, timeAgo } from "../utils/timeAgo";

export default function ItemDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [item, setItem] = useState(null);
    const [message, setMessage] = useState("");
    const [claims, setClaims] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { api.get(`/items/${id}`).then(r => setItem(r.data)); }, [id]);

    const isOwner = user && item && item.postedBy._id === user._id;

    useEffect(() => {
        if (isOwner) api.get(`/claims/item/${id}`).then(r => setClaims(r.data));
    }, [isOwner, id]);

    const submitClaim = async () => {
        setSubmitting(true);
        try {
            await api.post("/claims", { itemId: id, message });
            addToast("Claim submitted successfully!");
            setMessage("");
        } catch (err) {
            addToast(err.response?.data?.message || "Error submitting claim", "error");
        } finally { setSubmitting(false); }
    };

    const updateClaim = async (claimId, status) => {
        await api.put(`/claims/${claimId}`, { status });
        setClaims(claims.map(c => c._id === claimId ? { ...c, status } : c));
        if (status === "approved") {
            setItem({ ...item, status: "claimed" });
            addToast("Claim approved! Item marked as claimed.");
        } else {
            addToast("Claim rejected.");
        }
    };

    const markReturned = async () => {
        await api.put(`/items/${id}`, { status: "returned" });
        setItem({ ...item, status: "returned" });
        addToast("Item marked as returned! 🎉");
    };

    const deleteItem = async () => {
        if (!confirm("Delete this item permanently?")) return;
        await api.delete(`/items/${id}`);
        addToast("Item deleted.");
        navigate("/my-items");
    };

    if (!item) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                <p style={{ color: "var(--text-muted)" }}>Loading...</p>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
            <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                Back
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, alignItems: "start" }}>
                {/* Main */}
                <div>
                    <div className="card page-enter" style={{ overflow: "hidden" }}>
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title} style={{ width: "100%", maxHeight: 400, objectFit: "cover" }} />
                        ) : (
                            <div style={{ height: 200, background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                                </svg>
                            </div>
                        )}
                        <div style={{ padding: 28 }}>
                            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                                <span className={`badge badge-${item.type}`}>{item.type === "lost" ? "⚠ Lost" : "✓ Found"}</span>
                                <span className={`badge badge-${item.status}`}>{item.status}</span>
                            </div>
                            <h1 style={{ fontSize: 28, marginBottom: 12 }}>{item.title}</h1>
                            {item.description && <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 20 }}>{item.description}</p>}

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                                {[
                                    { label: "Location", value: item.location },
                                    { label: "Category", value: item.category.charAt(0).toUpperCase() + item.category.slice(1) },
                                    { label: "Posted by", value: item.postedBy.name },
                                    { label: "Date", value: formatDate(item.dateLostOrFound) },
                                    { label: "Reported", value: timeAgo(item.createdAt) },
                                ].map(({ label, value }) => (
                                    <div key={label} style={{ background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", padding: "12px 16px" }}>
                                        <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-light)", marginBottom: 4 }}>{label}</p>
                                        <p style={{ fontSize: 14, fontWeight: 500 }}>{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Owner actions */}
                            {isOwner && (
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                                    <Link to={`/edit/${item._id}`}>
                                        <button className="btn-outline" style={{ fontSize: 13 }}>✏ Edit item</button>
                                    </Link>
                                    {item.status === "claimed" && (
                                        <button className="btn-success" style={{ fontSize: 13 }} onClick={markReturned}>🏠 Mark as returned</button>
                                    )}
                                    <button className="btn-danger" style={{ fontSize: 13 }} onClick={deleteItem}>Delete</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Claims list (owner view) */}
                    {isOwner && claims.length > 0 && (
                        <div style={{ marginTop: 24 }}>
                            <h3 style={{ fontSize: 20, marginBottom: 16 }}>Claims ({claims.length})</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {claims.map(c => (
                                    <div key={c._id} className="card" style={{ padding: 20 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                            <div>
                                                <p style={{ fontWeight: 500, marginBottom: 2 }}>{c.claimedBy.name}</p>
                                                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                                    {c.claimedBy.email}{c.claimedBy.prn && ` · PRN: ${c.claimedBy.prn}`} · {timeAgo(c.createdAt)}
                                                </p>
                                            </div>
                                            <span className={`badge ${c.status === "pending" ? "badge-open" : c.status === "approved" ? "badge-found" : "badge-lost"}`}>{c.status}</span>
                                        </div>
                                        {c.message && <p style={{ fontSize: 14, color: "var(--text-muted)", background: "var(--bg-subtle)", padding: "10px 14px", borderRadius: "var(--radius-sm)", marginBottom: 12 }}>{c.message}</p>}
                                        {c.status === "pending" && (
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button className="btn-success" style={{ fontSize: 13, padding: "8px 16px" }} onClick={() => updateClaim(c._id, "approved")}>Approve</button>
                                                <button className="btn-danger" style={{ fontSize: 13, padding: "8px 16px" }} onClick={() => updateClaim(c._id, "rejected")}>Reject</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div style={{ position: "sticky", top: 88 }}>
                    {user && !isOwner && item.status === "open" && (
                        <div className="card page-enter" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 20, marginBottom: 6 }}>Is this yours?</h3>
                            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>Submit a claim and explain why this item belongs to you.</p>
                            <textarea rows={4} placeholder="Describe identifying details..."
                                value={message} onChange={e => setMessage(e.target.value)} style={{ resize: "vertical", marginBottom: 4 }} />
                            <button className="btn-primary" onClick={submitClaim} disabled={submitting} style={{ width: "100%", padding: "12px" }}>
                                {submitting ? "Submitting..." : "Submit claim"}
                            </button>
                        </div>
                    )}
                    {!user && (
                        <div className="card" style={{ padding: 24, textAlign: "center" }}>
                            <h3 style={{ fontSize: 18, marginBottom: 8 }}>Is this yours?</h3>
                            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>Sign in to submit a claim.</p>
                            <Link to="/login"><button className="btn-primary" style={{ width: "100%" }}>Sign in to claim</button></Link>
                        </div>
                    )}
                    {item.status !== "open" && !isOwner && (
                        <div className="card" style={{ padding: 24, textAlign: "center" }}>
                            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                            <h3 style={{ fontSize: 18, marginBottom: 8 }}>Item {item.status}</h3>
                            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>This item is no longer available for claiming.</p>
                        </div>
                    )}
                </div>
            </div>
            <style>{`@media(max-width:768px){.container>div:last-child{grid-template-columns:1fr!important}}`}</style>
        </div>
    );
}
