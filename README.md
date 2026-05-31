# Match-Me

A social matching platform where users can discover people nearby, connect, and chat in real time.

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.2.5, Spring Security, WebSocket
- **Frontend:** React 18, TypeScript, Vite
- **Database:** PostgreSQL 15 (migrations via Liquibase)
- **Auth:** JWT (stateless)

## Prerequisites

- Java 17+
- Node.js 18+
- Docker + Docker Compose

## Setup

### 1. Start the database

```bash
sudo docker compose up -d
```

### 2. Start the backend

```bash
cd backend
mvn spring-boot:run
```

To also seed 100 fictitious users on first run:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=seed
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Seeding

The seeder runs automatically when the `seed` Spring profile is active and the database is empty. It creates 100 users with full profiles, interests, and locations. All seeded users have the password `password123`.

Example seeded email: `alice.smith0@gmail.com`

## Reset and re-seed

To wipe all data and start fresh:

```bash
sudo docker compose down -v
sudo docker compose up -d
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=seed
```

## API Overview

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register with email + password |
| POST | `/auth/login` | Login, returns JWT |
| POST | `/auth/logout` | Logout |

### Users & Profiles
| Method | Path | Description |
|--------|------|-------------|
| GET | `/me` | Current user (id, name, profile picture) |
| GET | `/me/profile` | Current user's about-me info |
| PUT | `/me/profile` | Update profile |
| GET | `/me/bio` | Current user's biographical data |
| GET | `/users/:id` | Another user's basic info (no email) |
| GET | `/users/:id/profile` | Another user's about-me info |
| GET | `/users/:id/bio` | Another user's biographical data |

### Recommendations
| Method | Path | Description |
|--------|------|-------------|
| GET | `/recommendations` | List of up to 10 recommended user IDs |
| POST | `/recommendations/:id/dismiss` | Dismiss a recommendation |

### Connections
| Method | Path | Description |
|--------|------|-------------|
| GET | `/connections/active` | List of connected user IDs |
| GET | `/connections/pending` | List of pending request sender IDs |
| POST | `/connections/request?receiverId=` | Send connection request |
| POST | `/connections/accept?requesterId=` | Accept a request |
| PUT | `/connections/dismiss?requesterId=` | Decline a request |
| DELETE | `/connections/remove?connectedUserId=` | Disconnect |

### Chat
| Method | Path | Description |
|--------|------|-------------|
| GET | `/chats` | All chats, most recent first |
| GET | `/chats/:userId?page=1` | Message history (paginated, 30/page) |
| POST | `/chats/:userId` | Send a message |

### WebSocket

Connect to `ws://localhost:8080/ws/chat?token=<jwt>` for real-time messaging, typing indicators, and online/offline status.
