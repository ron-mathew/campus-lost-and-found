import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import uploadImage from "../utils/uploadImage";
import { useToast } from "../context/ToastContext";

export default function EditItem() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [form, setForm] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get(`/items/${id}`).then(r => {
            const { type, title, description, category, location, imageUrl, dateLostOrFound } = r.data;
            setForm({
                type, title, description, category, location, imageUrl,
                dateLostOrFound: dateLostOrFound ? dateLostOrFound.slice(0, 10) : ""
            });
            if (imageUrl) setPreview(imageUrl);
        });
    }, [id]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageUrl = form.imageUrl;
            if (imageFile) imageUrl = await uploadImage(imageFile);
            await api.put(`/items/${id}`, { ...form, imageUrl });
            addToast("Item updated successfully!");
            navigate(`/items/${id}`);
        } catch (err) {
            addToast(err.response?.data?.message || "Failed to update item", "error");
        } finally { setLoading(false); }
    };

    if (!form) return <div className="container" style={{ paddingTop: 40 }}>Loading...</div>;

    return (
        <div style={{ minHeight: "calc(100vh - 64px)", padding: "40px 24px" }}>
            <div style={{ maxWidth: 580, margin: "0 auto" }} className="page-enter">
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 32, marginBottom: 8 }}>Edit item</h1>
                    <p style={{ color: "var(--text-muted)" }}>Update the details for this item</p>
                </div>

                <div className="card" style={{ padding: 32 }}>
                    <form onSubmit={handleSubmit}>
                        <label>Item type</label>
                        <div style={{ display: "flex", gap: 10, margin: "8px 0 20px" }}>
                            {["lost", "found"].map(t => (
                                <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                                    style={{
                                        flex: 1, padding: "12px", border: "1.5px solid",
                                        borderColor: form.type === t ? (t === "lost" ? "var(--accent)" : "var(--found)") : "var(--border)",
                                        background: form.type === t ? (t === "lost" ? "var(--accent-light)" : "var(--found-light)") : "transparent",
                                        color: form.type === t ? (t === "lost" ? "var(--accent)" : "var(--found)") : "var(--text-muted)",
                                        borderRadius: "var(--radius-sm)", fontWeight: 500, fontSize: 14, transition: "var(--transition)",
                                    }}>
                                    {t === "lost" ? "⚠ Lost" : "✓ Found"}
                                </button>
                            ))}
                        </div>

                        <label>Title</label>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />

                        <label>Description</label>
                        <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: "vertical" }} />

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
                                <input type="date" value={form.dateLostOrFound} onChange={e => setForm({ ...form, dateLostOrFound: e.target.value })} required />
                            </div>
                        </div>

                        <label>Location</label>
                        <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />

                        <label>Photo</label>
                        <div style={{
                            border: "2px dashed var(--border)", borderRadius: "var(--radius-sm)",
                            padding: preview ? 0 : "32px 20px", textAlign: "center",
                            cursor: "pointer", overflow: "hidden", margin: "6px 0 16px",
                        }} onClick={() => document.getElementById("edit-img").click()}>
                            {preview ? (
                                <img src={preview} alt="preview" style={{ width: "100%", maxHeight: 200, objectFit: "cover" }} />
                            ) : (
                                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Click to upload a new photo</p>
                            )}
                        </div>
                        <input id="edit-img" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                        {preview && (
                            <button type="button" className="btn-ghost" style={{ fontSize: 13, marginBottom: 8 }}
                                onClick={() => { setImageFile(null); setPreview(null); setForm({ ...form, imageUrl: "" }); }}>
                                Remove photo
                            </button>
                        )}

                        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: "13px" }}>
                                {loading ? "Saving..." : "Save changes"}
                            </button>
                            <button type="button" className="btn-outline" onClick={() => navigate(-1)} style={{ padding: "13px 20px" }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
