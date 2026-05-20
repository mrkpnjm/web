const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const PAGE_SIZE = 30;

// GET /chats — all conversations for the logged-in user
router.get("/", requireAuth, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            `SELECT DISTINCT ON (other_id)
                other_id,
                last_message,
                last_at,
                unread_count
             FROM (
                SELECT
                    CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS other_id,
                    content AS last_message,
                    created_at AS last_at,
                    COUNT(*) FILTER (WHERE receiver_id = $1 AND read = false) OVER (
                        PARTITION BY CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END
                    ) AS unread_count
                FROM messages
                WHERE sender_id = $1 OR receiver_id = $1
                ORDER BY created_at DESC
             ) sub
             ORDER BY other_id, last_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /chats/:userId — message history with a specific user (paginated)
router.get("/:userId", requireAuth, async (req, res) => {
    const me = req.user.id;
    const other = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * PAGE_SIZE;
    try {
        const result = await pool.query(
            `SELECT id, sender_id, receiver_id, content, created_at, read
             FROM messages
             WHERE (sender_id = $1 AND receiver_id = $2)
                OR (sender_id = $2 AND receiver_id = $1)
             ORDER BY created_at DESC
             LIMIT $3 OFFSET $4`,
            [me, other, PAGE_SIZE, offset]
        );
        // Mark received messages as read
        await pool.query(
            `UPDATE messages SET read = true
             WHERE sender_id = $1 AND receiver_id = $2 AND read = false`,
            [other, me]
        );
        res.json(result.rows.reverse());
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /chats/:userId — send a message
router.post("/:userId", requireAuth, async (req, res) => {
    const me = req.user.id;
    const other = req.params.userId;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Content required" });
    try {
        const result = await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, content)
             VALUES ($1, $2, $3)
             RETURNING id, sender_id, receiver_id, content, created_at, read`,
            [me, other, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
