# Match-Me

A social matching platform where users can discover people nearby, connect, and chat in real time.

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.2.5, Spring Security, WebSocket
- **Frontend:** React 18, TypeScript, Vite, Bootstrap 5
- **Database:** PostgreSQL 15 (migrations via Liquibase)
- **Auth:** JWT (stateless)

## Prerequisites

- Java 17+
- Maven 3.6+
- Node.js 18+
- Docker + Docker Compose V2 (`docker compose`, not `docker-compose`)

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd web
```

### 2. Install Docker

Skip this step if Docker is already installed (`docker --version` returns a version number).

**Linux (Ubuntu/Debian):**

```bash
# Add Docker's official GPG key:
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

After installation, verify that Docker is running:
```bash
sudo systemctl status docker
```
If Docker is not running, start it manually:
```bash
sudo systemctl start docker
```
Verify that the installation is succesful by running the `hello-world` image:
```bash
sudo docker run hello-world
```

Add your user to the `docker` group so you can run Docker without `sudo`:

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
```

Then log out and log back in for the group change to take effect:

```bash
logout
```

Log back in:

```bash
su - $USER
```

**macOS / Windows:** Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/). Docker Compose V2 is included.

Verify the installation:

```bash
docker --version
docker compose version
```

### 3. Start the database

```bash
sudo docker compose up -d
```

### 4. Start the backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs at `http://localhost:8080`

To also seed 100 fictitious users on first run:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=seed
```

Optionally override the JWT signing secret:

```bash
export JWT_SECRET=your-long-random-secret
```

### 5. Start the frontend

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

All endpoints except `/auth/**` require the header `Authorization: Bearer <jwt>`.

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

`PUT /me/profile` accepts: `display_name`, `bio`, `avatar_url`, `location_id`, `age`, `gender`, `music_genre`, `looking_for`, `activity_level`, `latitude`, `longitude`, `max_radius_km`

`/me/profile` returns public-facing info (display name, avatar, about-me). `/me/bio` returns matching-relevant fields (age, gender, location, interests, search radius).

### Locations
| Method | Path | Description |
|--------|------|-------------|
| GET | `/locations` | Returns list of available locations |

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
| POST | `/chats/:userId` | Send a message. Body: `{ "content": "..." }` |

### WebSocket

Connect to `ws://localhost:8080/ws/chat?token=<jwt>` for real-time messaging, typing indicators, and online/offline status.

**Incoming events** (server → client):

| `type` | Additional fields | Description |
|--------|-------------------|-------------|
| `message` | `message` (object) | New incoming message |
| `typing` | `from`, `isTyping` (bool) | Other user's typing state |
| `online` | `userId`, `online` (bool) | User came online or offline |

**Outgoing events** (client → server):

| `type` | Additional fields | Description |
|--------|-------------------|-------------|
| `message` | `to`, `content` | Send a message |
| `typing` | `to`, `isTyping` (bool) | Broadcast typing state |

## Features

- **Authentication** — Register and log in with email and password. All sessions are stateless via JWT.
- **Profile setup** — Users fill out a profile with display name, avatar, bio, age, gender, location, music taste, activity level, and what they are looking for.
- **Location-based recommendations** — The platform suggests up to 10 candidate users based on proximity (GPS coordinates or city) and shared interests. Unwanted suggestions can be dismissed.
- **Connections** — Users can send, accept, and decline connection requests. Only accepted connections can exchange messages.
- **Real-time chat** — Connected users can chat via WebSocket with live typing indicators and online/offline presence.
- **Paginated message history** — Past conversations are loaded 30 messages per page.
