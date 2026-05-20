const { WebSocketServer } = require("ws");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const clients = new Map(); // userId -> ws

function setupWebSocket(server) {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws, req) => {
        const url = new URL(req.url, "http://localhost");
        const token = url.searchParams.get("token");

        let userId;
        try {
            userId = jwt.verify(token, process.env.JWT_SECRET).id;
        } catch {
            ws.close(1008, "Invalid token");
            return;
        }

        clients.set(userId, ws);
        broadcastOnlineStatus(userId, true);

        ws.on("message", async (data) => {
            let msg;
            try { msg = JSON.parse(data); } catch { return; }

            if (msg.type === "message") {
                await handleMessage(userId, msg);
            } else if (msg.type === "typing") {
                forwardTyping(userId, msg.to, msg.isTyping);
            }
        });

        ws.on("close", () => {
            clients.delete(userId);
            broadcastOnlineStatus(userId, false);
        });
    });
}

async function handleMessage(senderId, msg) {
    const { to, content } = msg;
    if (!to || !content) return;
    try {
        const result = await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, content)
             VALUES ($1, $2, $3)
             RETURNING id, sender_id, receiver_id, content, created_at, read`,
            [senderId, to, content]
        );
        const message = result.rows[0];
        send(to, { type: "message", message });
        send(senderId, { type: "message", message });
    } catch (err) {
        console.error(err);
    }
}

function forwardTyping(from, to, isTyping) {
    send(to, { type: "typing", from, isTyping });
}

function broadcastOnlineStatus(userId, online) {
    const payload = JSON.stringify({ type: "online", userId, online });
    for (const [, ws] of clients) {
        if (ws.readyState === 1) ws.send(payload);
    }
}

function send(userId, payload) {
    const ws = clients.get(userId);
    if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify(payload));
    }
}

module.exports = { setupWebSocket };
