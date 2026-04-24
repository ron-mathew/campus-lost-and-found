import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", form);
            login(data);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: "calc(100vh - 64px)", display: "flex" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                <div style={{ width: "100%", maxWidth: 400 }} className="page-enter">
                    <div style={{ marginBottom: 32 }}>
                        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Welcome back</h1>
                        <p style={{ color: "var(--text-muted)" }}>Sign in to manage your lost & found items</p>
                    </div>

                    {error && <div className="error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <label>Email address</label>
                        <input type="email" placeholder="you@example.com" value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })} required />
                        <label>Password</label>
                        <input type="password" placeholder="••••••••" value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })} required />
                        <button type="submit" className="btn-primary" disabled={loading}
                            style={{ width: "100%", padding: "13px", fontSize: 15, marginTop: 4 }}>
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <p style={{ textAlign: "center", marginTop: 24, color: "var(--text-muted)", fontSize: 14 }}>
                        Don't have an account?{" "}
                        <Link to="/register" style={{ color: "var(--accent)", fontWeight: 500 }}>Create one</Link>
                    </p>
                </div>
            </div>

            <div style={{ flex: 1, background: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", padding: 48, position: "relative", overflow: "hidden" }}
                className="hide-mobile">
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 70%, rgba(200,80,26,0.2) 0%, transparent 60%)" }} />
                <div style={{ position: "relative", color: "white", maxWidth: 360 }}>
                    <h2 style={{ fontSize: 36, marginBottom: 20, lineHeight: 1.2 }}>Find what you've lost, return what you've found</h2>
                    <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                        Our campus lost & found system connects students, faculty, and staff to help reunite people with their belongings.
                    </p>
                </div>
            </div>
            <style>{`@media(max-width:768px){.hide-mobile{display:none}}`}</style>
        </div>
    );
}
