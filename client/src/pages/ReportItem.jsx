import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import uploadImage from "../utils/uploadImage";

export default function ReportItem() {
    const [form, setForm] = useState({ type: "lost", title: "", description: "", category: "other", location: "", dateLostOrFound: "" });
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            let imageUrl = "";
            if (imageFile) imageUrl = await uploadImage(imageFile);
            await api.post("/items", { ...form, imageUrl });
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to report item");
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: "calc(100vh - 64px)", padding: "40px 24px" }}>
            <div style={{ maxWidth: 580, margin: "0 auto" }} className="page-enter">
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 32, marginBottom: 8 }}>Report an item</h1>
                    <p style={{ color: "var(--text-muted)" }}>Fill in the details to help others find or identify this item</p>
                </div>

                {error && <div className="error">{error}</div>}

                <div className="card" style={{ padding: 32 }}>
                    <form onSubmit={handleSubmit}>
                        {/* Type toggle */}
                        <label>Item type</label>
                        <div style={{ display: "flex", gap: 10, margin: "8px 0 20px" }}>
                            {["lost", "found"].map(t => (
                                <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                                    style={{
                                        flex: 1, padding: "12px", border: "1.5px solid",
                                        borderColor: form.type === t ? (t === "lost" ? "var(--accent)" : "var(--found)") : "var(--border)",
                                        background: form.type === t ? (t === "lost" ? "var(--accent-light)" : "var(--found-light)") : "transparent",
                                        color: form.type === t ? (t === "lost" ? "var(--accent)" : "var(--found)") : "var(--text-muted)",
                                        borderRadius: "var(--radius-sm)", fontWeight: 500, fontSize: 14,
                                        transition: "var(--transition)",
                                    }}>
                                    {t === "lost" ? "⚠ I lost something" : "✓ I found something"}
                                </button>
                            ))}
                        </div>

                        <label>Title</label>
                        <input placeholder="e.g. Blue backpack with laptop" value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })} required />

                        <label>Description</label>
                        <textarea rows={3} placeholder="Describe the item in detail — color, brand, distinguishing features..."
                            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                            style={{ resize: "vertical" }} />

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <label>Category</label>
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    {["electronics", "clothing", "accessories", "books", "documents", "keys", "wallet", "other"].map(c =>
                                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label>Date {form.type === "lost" ? "lost" : "found"}</label>
                                <input type="date" value={form.dateLostOrFound}
                                    onChange={e => setForm({ ...form, dateLostOrFound: e.target.value })} required />
                            </div>
                        </div>

                        <label>Location</label>
                        <input placeholder="e.g. Library 2nd floor, Canteen, Block A" value={form.location}
                            onChange={e => setForm({ ...form, location: e.target.value })} required />

                        <label>Photo (optional)</label>
                        <div style={{
                            border: "2px dashed var(--border)", borderRadius: "var(--radius-sm)",
                            padding: preview ? 0 : "32px 20px", textAlign: "center",
                            cursor: "pointer", transition: "var(--transition)", overflow: "hidden",
                            margin: "6px 0 16px",
                        }}
                            onClick={() => document.getElementById("img-input").click()}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setImageFile(f); setPreview(URL.createObjectURL(f)); } }}
                        >
                            {preview ? (
                                <img src={preview} alt="preview" style={{ width: "100%", maxHeight: 220, objectFit: "cover" }} />
                            ) : (
                                <>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 10 }}>
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Click or drag to upload a photo</p>
                                    <p style={{ color: "var(--text-light)", fontSize: 12, marginTop: 4 }}>PNG, JPG up to 10MB</p>
                                </>
                            )}
                        </div>
                        <input id="img-input" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                        {preview && (
                            <button type="button" className="btn-ghost" style={{ fontSize: 13, marginBottom: 8 }}
                                onClick={() => { setImageFile(null); setPreview(null); }}>
                                Remove photo
                            </button>
                        )}

                        <button type="submit" className="btn-primary" disabled={loading}
                            style={{ width: "100%", padding: "14px", fontSize: 15, marginTop: 8 }}>
                            {loading ? (imageFile ? "Uploading image..." : "Submitting...") : `Submit ${form.type} report`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
