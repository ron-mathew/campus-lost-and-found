import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { timeAgo } from "../utils/timeAgo";

const ITEMS_PER_PAGE = 12;

const ItemCard = ({ item }) => (
    <Link to={`/items/${item._id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <div className="card" style={{ overflow: "hidden", cursor: "pointer", height: "100%", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = ""; }}
        >
            {item.imageUrl ? (
                <div style={{ height: 180, overflow: "hidden", background: "var(--bg-subtle)" }}>
                    <img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                        onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
                        onMouseLeave={e => e.target.style.transform = "scale(1)"}
                    />
                </div>
            ) : (
                <div style={{ height: 180, background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                    </svg>
                </div>
            )}
            <div style={{ padding: "16px 18px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span className={`badge badge-${item.type}`}>{item.type === "lost" ? "⚠ Lost" : "✓ Found"}</span>
                    <span style={{ fontSize: 12, color: "var(--text-light)" }}>{timeAgo(item.createdAt)}</span>
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 6, fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>{item.title}</h3>
                {item.description && (
                    <p style={{
                        fontSize: 13, color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.5,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                    }}>
                        {item.description}
                    </p>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                    <span style={{ fontSize: 12, color: "var(--text-light)", display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                        {item.location}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-light)" }}>{item.category}</span>
                </div>
            </div>
        </div>
    </Link>
);

export default function Dashboard() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchItems = async () => {
        setLoading(true);
        setPage(1);
        try {
            const params = {};
            if (search) params.search = search;
            if (type) params.type = type;
            if (category) params.category = category;
            const { data } = await api.get("/items", { params });
            setItems(data);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchItems(); }, [type, category]);

    const lostCount = items.filter(i => i.type === "lost").length;
    const foundCount = items.filter(i => i.type === "found").length;

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const paginated = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <div style={{ minHeight: "calc(100vh - 64px)" }}>
            {/* Hero */}
            <div style={{ background: "var(--text)", color: "white", padding: "56px 24px 48px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(200,80,26,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(200,80,26,0.1) 0%, transparent 50%)" }} />
                <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 12 }}>Campus Lost & Found</p>
                    <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", marginBottom: 14, letterSpacing: "-0.02em" }}>
                        Reuniting people<br />with their belongings
                    </h1>
                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 480, marginBottom: 32 }}>
                        Because every belonging deserves to find its way home.
                    </p>
                    <div style={{ display: "flex", gap: 32 }}>
                        {[{ n: items.length, label: "Total Items" }, { n: lostCount, label: "Lost" }, { n: foundCount, label: "Found" }].map(({ n, label }) => (
                            <div key={label}>
                                <div style={{ fontSize: 28, fontFamily: "'DM Serif Display', serif", color: "white" }}>{n}</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search bar */}
            <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "16px 24px", position: "sticky", top: 64, zIndex: 10 }}>
                <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
                        <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input placeholder="Search items..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && fetchItems()}
                            style={{ margin: 0, paddingLeft: 36 }} />
                    </div>
                    {[
                        { value: type, onChange: setType, options: [["", "All Types"], ["lost", "Lost"], ["found", "Found"]] },
                        { value: category, onChange: setCategory, options: [["", "All Categories"], ...["electronics", "clothing", "accessories", "books", "documents", "keys", "wallet", "other"].map(c => [c, c.charAt(0).toUpperCase() + c.slice(1)])] },
                    ].map((sel, i) => (
                        <select key={i} value={sel.value} onChange={e => sel.onChange(e.target.value)} style={{ width: "auto", margin: 0, minWidth: 140 }}>
                            {sel.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    ))}
                    <button className="btn-primary" onClick={fetchItems}>Search</button>
                    {!user && <Link to="/register"><button className="btn-outline" style={{ whiteSpace: "nowrap" }}>Report an item →</button></Link>}
                </div>
            </div>

            {/* Grid */}
            <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
                {loading ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} style={{ height: 300, borderRadius: "var(--radius)", background: "var(--bg-card)", border: "1px solid var(--border)", overflow: "hidden" }}>
                                <div style={{ height: 180, background: "linear-gradient(90deg,var(--bg-subtle) 25%,var(--border) 50%,var(--bg-subtle) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
                                <div style={{ padding: 18 }}>
                                    <div style={{ height: 12, width: "60%", background: "var(--bg-subtle)", borderRadius: 6, marginBottom: 8 }} />
                                    <div style={{ height: 16, width: "80%", background: "var(--bg-subtle)", borderRadius: 6 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px 0" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                        <h3 style={{ fontSize: 20, marginBottom: 8 }}>No items found</h3>
                        <p style={{ color: "var(--text-muted)" }}>Try adjusting your filters or search terms</p>
                    </div>
                ) : (
                    <>
                        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>
                            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, items.length)} of {items.length} items
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginBottom: 32 }}>
                            {paginated.map(item => <ItemCard key={item._id} item={item} />)}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                                <button className="btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    style={{ padding: "8px 16px", fontSize: 13, opacity: page === 1 ? 0.4 : 1 }}>← Previous</button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i} onClick={() => setPage(i + 1)} style={{
                                        width: 36, height: 36, borderRadius: "var(--radius-sm)", border: "1.5px solid",
                                        borderColor: page === i + 1 ? "var(--accent)" : "var(--border)",
                                        background: page === i + 1 ? "var(--accent)" : "transparent",
                                        color: page === i + 1 ? "white" : "var(--text)",
                                        fontSize: 13, fontWeight: 500, cursor: "pointer",
                                    }}>{i + 1}</button>
                                ))}
                                <button className="btn-outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    style={{ padding: "8px 16px", fontSize: 13, opacity: page === totalPages ? 0.4 : 1 }}>Next →</button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        </div>
    );
}
