require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const { setupWebSocket } = require("./chat/websocket");

const authRoutes = require("./auth/routes");
const chatRoutes = require("./chat/routes");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/chats", chatRoutes);

// Placeholder routes for Person 2 and 3 (they will fill these in)
app.use("/users", (req, res) => res.status(501).json({ error: "Not implemented" }));
app.use("/me", (req, res) => res.status(501).json({ error: "Not implemented" }));
app.use("/recommendations", (req, res) => res.status(501).json({ error: "Not implemented" }));
app.use("/connections", (req, res) => res.status(501).json({ error: "Not implemented" }));

const server = http.createServer(app);
setupWebSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
