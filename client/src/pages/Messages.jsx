import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { timeAgo } from "../utils/timeAgo";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");

export default function Messages() {
    const { chatId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [activeChat, setActiveChat] = useState(null);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef();

    // Load all chats
    useEffect(() => {
        api.get("/chats").then(r => {
            setChats(r.data);
            if (chatId) {
                const found = r.data.find(c => c._id === chatId);
                if (found) setActiveChat(found);
            } else if (r.data.length > 0) {
                setActiveChat(r.data[0]);
                navigate(`/messages/${r.data[0]._id}`, { replace: true });
            }
        });

        // Join socket with userId
        socket.emit("user_join", user._id);

        return () => { socket.off("receive_message"); };
    }, []);

    // Load messages when active chat changes
    useEffect(() => {
        if (!activeChat) return;
        socket.emit("join_chat", activeChat._id);
        api.get(`/chats/${activeChat._id}/messages`).then(r => setMessages(r.data));

        socket.on("receive_message", (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        return () => {
            socket.emit("leave_chat", activeChat._id);
            socket.off("receive_message");
        };
    }, [activeChat?._id]);

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim() || !activeChat) return;
        setSending(true);
        try {
            const { data: msg } = await api.post(`/chats/${activeChat._id}/messages`, { text });
            socket.emit("send_message", { chatId: activeChat._id, message: msg });
            setText("");
            // Update last message in sidebar
            setChats(prev => prev.map(c => c._id === activeChat._id ? { ...c, lastMessage: text, lastMessageAt: new Date() } : c));
        } finally { setSending(false); }
    };

    const selectChat = (chat) => {
        setActiveChat(chat);
        navigate(`/messages/${chat._id}`);
    };

    const getOtherParticipant = (chat) => chat.participants.find(p => p._id !== user._id);

    return (
        <div style={{ height: "calc(100vh - 64px)", display: "flex", overflow: "hidden" }}>
            {/* Sidebar */}
            <div style={{ width: 320, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", background: "var(--bg-card)", flexShrink: 0 }}>
                <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid var(--border)" }}>
                    <h2 style={{ fontSize: 20 }}>Messages</h2>
                </div>
                <div style={{ flex: 1, overflowY: "auto" }}>
                    {chats.length === 0 ? (
                        <div style={{ padding: 24, textAlign: "center" }}>
                            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 8 }}>No conversations yet</p>
                            <p style={{ fontSize: 13, color: "var(--text-light)" }}>Chats appear here when a claim is approved</p>
                        </div>
                    ) : chats.map(chat => {
                        const other = getOtherParticipant(chat);
                        const isActive = activeChat?._id === chat._id;
                        return (
                            <div key={chat._id} onClick={() => selectChat(chat)} style={{
                                padding: "14px 20px", cursor: "pointer", display: "flex", gap: 12, alignItems: "center",
                                background: isActive ? "var(--accent-light)" : "transparent",
                                borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                                transition: "var(--transition)",
                            }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--bg-subtle)"; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                            >
                                <div style={{ width: 40, height: 40, borderRadius: "50%", background: isActive ? "var(--accent)" : "var(--bg-subtle)", color: isActive ? "white" : "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, flexShrink: 0 }}>
                                    {other?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                                        <p style={{ fontSize: 14, fontWeight: 500, color: isActive ? "var(--accent-dark)" : "var(--text)" }}>{other?.name}</p>
                                        <span style={{ fontSize: 11, color: "var(--text-light)" }}>{timeAgo(chat.lastMessageAt)}</span>
                                    </div>
                                    <p style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {chat.item?.title}
                                    </p>
                                    {chat.lastMessage && (
                                        <p style={{ fontSize: 12, color: "var(--text-light)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {chat.lastMessage}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat area */}
            {activeChat ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    {/* Chat header */}
                    <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg-card)", display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600 }}>
                            {getOtherParticipant(activeChat)?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p style={{ fontWeight: 500, fontSize: 15 }}>{getOtherParticipant(activeChat)?.name}</p>
                            <Link to={`/items/${activeChat.item?._id}`} style={{ fontSize: 12, color: "var(--accent)" }}>
                                Re: {activeChat.item?.title} →
                            </Link>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                        {messages.length === 0 && (
                            <div style={{ textAlign: "center", marginTop: 40 }}>
                                <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No messages yet. Say hello! 👋</p>
                            </div>
                        )}
                        {messages.map((msg, i) => {
                            const isMe = msg.sender._id === user._id;
                            const showAvatar = i === 0 || messages[i - 1]?.sender._id !== msg.sender._id;
                            return (
                                <div key={msg._id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
                                    {!isMe && (
                                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: showAvatar ? "var(--bg-subtle)" : "transparent", border: showAvatar ? "1.5px solid var(--border)" : "none", color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                                            {showAvatar ? msg.sender.name?.charAt(0).toUpperCase() : ""}
                                        </div>
                                    )}
                                    <div style={{ maxWidth: "65%" }}>
                                        <div style={{
                                            padding: "10px 14px", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                            background: isMe ? "var(--accent)" : "var(--bg-card)",
                                            color: isMe ? "white" : "var(--text)",
                                            border: isMe ? "none" : "1px solid var(--border)",
                                            fontSize: 14, lineHeight: 1.5,
                                            boxShadow: "var(--shadow-sm)",
                                        }}>
                                            {msg.text}
                                        </div>
                                        <p style={{ fontSize: 11, color: "var(--text-light)", marginTop: 4, textAlign: isMe ? "right" : "left" }}>
                                            {timeAgo(msg.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", background: "var(--bg-card)", display: "flex", gap: 10 }}>
                        <input
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder="Type a message..."
                            style={{ flex: 1, margin: 0, borderRadius: 24, padding: "10px 18px" }}
                            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend(e)}
                        />
                        <button type="submit" className="btn-primary" disabled={sending || !text.trim()}
                            style={{ borderRadius: 24, padding: "10px 20px", opacity: !text.trim() ? 0.5 : 1 }}>
                            Send
                        </button>
                    </form>
                </div>
            ) : (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                        <h3 style={{ fontSize: 20, marginBottom: 8 }}>Your messages</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Select a conversation or wait for a claim to be approved</p>
                    </div>
                </div>
            )}
        </div>
    );
}
