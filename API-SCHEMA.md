# Database Schema

```
users: id(UUID PK), email(UNIQUE NOT NULL), password_hash(NOT NULL), created_at

profiles: id(UUID FK users), display_name, bio, avatar_url,
location_id(FK locations), looking_for, activity_level,
social_preference, communication_style, primary_interest, created_at

locations: id(SERIAL PK), country(NOT NULL)

dismissed_recommendations: id(UUID PK), user_id(FK users),
dismissed_id(FK users), created_at

connections: id(UUID PK), sender_id(FK fk_conn_sender), receiver_id(FK fk_conn_receiver),
status(pending/accepted/declined), created_at

messages: id(UUID PK), sender_id(FK users), receiver_id(FK users),
content(NOT NULL), read(bool), created_at
```

---

# API Response Shapes

```
POST /auth/register  →  { token }
POST /auth/login     →  { token }
POST /auth/logout    →  { message }

GET /users/:id         →  { id, name, profile_picture }
GET /users/:id/profile →  { id, bio, location }
GET /users/:id/bio     →  { id, looking_for, activity_level, social_preference,
                            communication_style, primary_interest }

GET /me         →  { id, name, profile_picture, email }
GET /me/profile →  same as /users/:id/profile
GET /me/bio     →  same as /users/:id/bio

GET    /recommendations  →  [{ id }] max 10
GET    /connections      →  [{ id }]
POST   /connections/:id  →  send request
PUT    /connections/:id  →  accept request
DELETE /connections/:id  →  dismiss or disconnect

GET  /chats          →  [{ other_id, last_message, last_at, unread_count }]
GET  /chats/:id?page →  [{ id, sender_id, receiver_id, content, read, created_at }]
POST /chats/:id      →  { id, sender_id, receiver_id, content, read, created_at }

WS /ws/chat?token=...
client → server: { type: message|typing, to, content|isTyping }
server → client: { type: message|typing|online, ... }
```
