require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "http://localhost:5173", methods: ["GET", "POST"] },
});

connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/items", require("./routes/items"));
app.use("/api/claims", require("./routes/claims")(io));
app.use("/api/chats", require("./routes/chats"));
app.use("/api/notifications", require("./routes/notifications"));

app.use(errorHandler);

// Socket.io
io.on("connection", (socket) => {
    socket.on("user_join", (userId) => {
        socket.join(userId);
    });

    socket.on("join_chat", (chatId) => {
        socket.join(chatId);
    });

    socket.on("leave_chat", (chatId) => {
        socket.leave(chatId);
    });

    socket.on("send_message", (data) => {
        io.to(data.chatId).emit("receive_message", data.message);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));