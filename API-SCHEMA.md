# Database Schema

## users (Person 1)
| Column | Type |
|--------|------|
| id | UUID PK |
| email | VARCHAR(255) UNIQUE NOT NULL |
| password_hash | VARCHAR(255) NOT NULL |
| created_at | TIMESTAMPTZ |

## profiles (Person 2)
| Column | Type |
|--------|------|
| id | UUID PK FK → users.id |
| display_name | VARCHAR(100) NOT NULL |
| bio | TEXT |
| avatar_url | VARCHAR(500) |
| location_id | INT FK → locations.id |
| age | INT |
| gender | VARCHAR(50) |
| music_genre | VARCHAR(100) |
| looking_for | VARCHAR(100) |
| activity_level | VARCHAR(50) |
| created_at | TIMESTAMPTZ |

## interests (Person 2)
| Column | Type |
|--------|------|
| id | SERIAL PK |
| user_id | UUID FK → users.id |
| interest | VARCHAR(100) NOT NULL |

## locations (Person 2)
| Column | Type |
|--------|------|
| id | SERIAL PK |
| city | VARCHAR(100) NOT NULL |
| country | VARCHAR(100) NOT NULL |

## dismissed_recommendations (Person 2)
| Column | Type |
|--------|------|
| id | UUID PK |
| user_id | UUID FK → users.id |
| dismissed_id | UUID FK → users.id |
| created_at | TIMESTAMPTZ |

## connections (Person 3)
| Column | Type |
|--------|------|
| id | UUID PK |
| requester_id | UUID FK → users.id |
| receiver_id | UUID FK → users.id |
| status | VARCHAR(20) — pending/accepted/dismissed |
| created_at | TIMESTAMPTZ |

## messages (Person 1)
| Column | Type |
|--------|------|
| id | UUID PK |
| sender_id | UUID FK → users.id |
| receiver_id | UUID FK → users.id |
| content | TEXT NOT NULL |
| read | BOOLEAN DEFAULT false |
| created_at | TIMESTAMPTZ |

---

# API Response Shapes

## Auth
```
POST /auth/register  →  { token }
POST /auth/login     →  { token }
POST /auth/logout    →  { message }
```

## Users
```
GET /users/:id         →  { id, name, profile_picture }
GET /users/:id/profile →  { id, bio, location }
GET /users/:id/bio     →  { id, age, gender, interests[], music_genre, looking_for, activity_level }

GET /me         →  { id, name, profile_picture, email }
GET /me/profile →  same as /users/:id/profile
GET /me/bio     →  same as /users/:id/bio
```

## Recommendations & Connections
```
GET    /recommendations  →  [{ id }]  (max 10)
GET    /connections      →  [{ id }]

POST   /connections/:id  →  send request
PUT    /connections/:id  →  accept request
DELETE /connections/:id  →  dismiss or disconnect
```

## Chat
```
GET  /chats          →  [{ other_id, last_message, last_at, unread_count }]
GET  /chats/:id?page →  [{ id, sender_id, receiver_id, content, read, created_at }]
POST /chats/:id      →  { id, sender_id, receiver_id, content, read, created_at }
```

## WebSocket
```
ws://host/ws/chat?token=...

client → server:
  { type: "message", to: "uuid", content: "..." }
  { type: "typing",  to: "uuid", isTyping: true }

server → client:
  { type: "message", message: { id, sender_id, receiver_id, content, read, created_at } }
  { type: "typing",  from: "uuid", isTyping: true }
  { type: "online",  userId: "uuid", online: true }
```
