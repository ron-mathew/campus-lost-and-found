import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

export default function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "", prn: "", role: "student" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data } = await api.post("/auth/register", form);
            login(data);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ width: "100%", maxWidth: 440 }} className="page-enter">
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 32, marginBottom: 8 }}>Create an account</h1>
                    <p style={{ color: "var(--text-muted)" }}>Join your campus lost & found community</p>
                </div>

                {error && <div className="error">{error}</div>}

                <div className="card" style={{ padding: 28 }}>
                    <form onSubmit={handleSubmit}>
                        <label>Full name</label>
                        <input placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        <label>Email address</label>
                        <input type="email" placeholder="you@college.edu" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        <label>Password</label>
                        <input type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                                <label>PRN (optional)</label>
                                <input placeholder="e.g. 21070126001" value={form.prn} onChange={e => setForm({ ...form, prn: e.target.value })} />
                            </div>
                            <div>
                                <label>Role</label>
                                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}
                            style={{ width: "100%", padding: "13px", fontSize: 15, marginTop: 4 }}>
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: "center", marginTop: 20, color: "var(--text-muted)", fontSize: 14 }}>
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: "var(--accent)", fontWeight: 500 }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
