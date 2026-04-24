import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

export default function MyItems() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const [itemsRes, meRes] = await Promise.all([api.get("/items"), api.get("/auth/me")]);
            setItems(itemsRes.data.filter(i => i.postedBy._id === meRes.data._id));
            setLoading(false);
        };
        load();
    }, []);

    const deleteItem = async (id) => {
        if (!confirm("Delete this item?")) return;
        await api.delete(`/items/${id}`);
        setItems(items.filter(i => i._id !== id));
    };

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 32, marginBottom: 4 }}>My Items</h1>
                    <p style={{ color: "var(--text-muted)" }}>{items.length} item{items.length !== 1 ? "s" : ""} reported</p>
                </div>
                <Link to="/report"><button className="btn-primary">+ Report item</button></Link>
            </div>

            {loading ? (
                <p style={{ color: "var(--text-muted)" }}>Loading...</p>
            ) : items.length === 0 ? (
                <div className="card" style={{ padding: 48, textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
                    <h3 style={{ fontSize: 20, marginBottom: 8 }}>No items yet</h3>
                    <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>You haven't reported any lost or found items.</p>
                    <Link to="/report"><button className="btn-primary">Report your first item</button></Link>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                    {items.map(item => (
                        <div key={item._id} className="card" style={{ overflow: "hidden" }}>
                            {item.imageUrl && (
                                <div style={{ height: 160, overflow: "hidden" }}>
                                    <img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                            )}
                            <div style={{ padding: "16px 18px 18px" }}>
                                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                                    <span className={`badge badge-${item.type}`}>{item.type === "lost" ? "⚠ Lost" : "✓ Found"}</span>
                                    <span className={`badge badge-${item.status}`}>{item.status}</span>
                                </div>
                                <h3 style={{ fontSize: 16, marginBottom: 6, fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>{item.title}</h3>
                                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>{item.location} · {item.category}</p>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <Link to={`/items/${item._id}`} style={{ flex: 1 }}>
                                        <button className="btn-outline" style={{ width: "100%", fontSize: 13 }}>View</button>
                                    </Link>
                                    <button className="btn-danger" style={{ fontSize: 13, padding: "8px 14px" }} onClick={() => deleteItem(item._id)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
