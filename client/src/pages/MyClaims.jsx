import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

const statusColor = { pending: "badge-open", approved: "badge-found", rejected: "badge-lost" };

export default function MyClaims() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/claims/my").then(r => { setClaims(r.data); setLoading(false); });
    }, []);

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 32, marginBottom: 4 }}>My Claims</h1>
                <p style={{ color: "var(--text-muted)" }}>{claims.length} claim{claims.length !== 1 ? "s" : ""} submitted</p>
            </div>

            {loading ? (
                <p style={{ color: "var(--text-muted)" }}>Loading...</p>
            ) : claims.length === 0 ? (
                <div className="card" style={{ padding: 48, textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                    <h3 style={{ fontSize: 20, marginBottom: 8 }}>No claims yet</h3>
                    <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>Browse items and submit a claim if you find something that belongs to you.</p>
                    <Link to="/"><button className="btn-primary">Browse items</button></Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {claims.map(claim => (
                        <div key={claim._id} className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                    <h3 style={{ fontSize: 17, fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>{claim.itemId?.title}</h3>
                                    <span className={`badge ${statusColor[claim.status]}`}>{claim.status}</span>
                                </div>
                                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                    {claim.itemId?.location} · {claim.itemId?.type === "lost" ? "Lost item" : "Found item"}
                                </p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                {claim.status === "approved" && (
                                    <span style={{ fontSize: 13, color: "var(--found)", fontWeight: 500 }}>🎉 Approved!</span>
                                )}
                                {claim.status === "rejected" && (
                                    <span style={{ fontSize: 13, color: "var(--accent)" }}>Not approved</span>
                                )}
                                <Link to={`/items/${claim.itemId?._id}`}>
                                    <button className="btn-outline" style={{ fontSize: 13, padding: "8px 16px" }}>View item →</button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
