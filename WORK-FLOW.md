# Equal 3-Way Split
Each person owns: backend domain + matching frontend pages + database tables for their area.

## Person 1 — Auth + Chat

### Backend:
- Register, login, logout
- JWT middleware (used by everyone, build it first)
- Chat REST endpoints (message history, pagination)
- WebSocket server (real-time delivery, unread count, typing indicator, online/offline)

### Frontend:
- Register page
- Login page
- Chat list page (all chats, most recent first, unread badge)
- Chat view page (messages + real-time, date/time per message)

### Database:
- users table
- messages table
- Seeder script (100 fictitious users)

## Person 2 — Profiles + Recommendations

### Backend:
- Profile CRUD (bio, picture upload/remove, location)
- All user endpoints: /users/:id, /users/:id/profile, /users/:id/bio, /me, /me/profile, /me/bio
- Recommendation algorithm (5+ data points, scoring, location filter, dismiss, max 10)
- /recommendations endpoint

### Frontend:
- Profile setup page (required before seeing recommendations)
- Profile edit page
- Profile view page (other user's profile)
- Recommendations page (list, connect/dismiss buttons)

### Database:
- profiles table
- bio table (the 5+ data points)
- locations table
- dismissed_recommendations table

## Person 3 — Connections + Infrastructure

### Backend:
- Connection requests (send, accept, dismiss, disconnect)
- /connections endpoint
- HTTP 404 for unauthorized/missing profile access
- Docker setup, environment config

### Frontend:
- Connections page (incoming requests + connected users list)
- Connection request UI on recommendation cards
- Navbar/layout (logout button accessible from every page)
- Responsive CSS (mobile + desktop for all pages)

### Database:
- connections table
- connection_requests table
- Migration files (owns the migration runner, others PR their table migrations into here)


## Project Structure

```text
match-me/
├── backend/
│   ├── cmd/main.go
│   ├── internal/
│   │   ├── auth/              ← Person 1
│   │   ├── users/             ← Person 2
│   │   ├── recommendations/   ← Person 2
│   │   ├── connections/       ← Person 3
│   │   ├── chat/              ← Person 1
│   │   ├── middleware/        ← Person 1 (JWT), shared
│   │   └── db/                ← shared
│   ├── migrations/            ← Person 3 owns runner, everyone PRs their tables
│   └── seeder/                ← Person 1
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/          ← Person 1
│   │   │   ├── profile/       ← Person 2
│   │   │   ├── recommendations/ ← Person 2
│   │   │   ├── connections/   ← Person 3
│   │   │   └── chat/          ← Person 1
│   │   ├── components/        ← shared
│   │   ├── hooks/             ← shared
│   │   ├── api/               ← shared, typed fetch wrappers
│   │   └── types/             ← shared, TS interfaces matching API responses
│   └── ...
└── docker-compose.yml         ← Person 3
```


### Steps to Completion

#### Day 1 — All three together (do not skip)
- Agree on DB schema (all tables, all columns)
- Agree on API response shapes and write them down
- P3: Docker + PostgreSQL + migration runner working
- P1: Go server skeleton + React app scaffolded
- Then everyone branches off
  
#### Day 2 — Parallel
- P1: Register/login/logout + JWT middleware
- P2: Profile tables + profile CRUD endpoints
- P3: Connections tables + Docker working end-to-end

#### Day 3 — Parallel
- P1: Chat REST endpoints + seeder started
- P2: Recommendation algorithm + /recommendations endpoint
- P3: Connection request flow + navbar/layout

#### Day 4 — Wire everything together
- P1: JWT middleware shipped — P2 and P3 protect their routes now
- P1: WebSocket server started 
- P2: Recommendations page wired to real API
- P3: Connections page wired to real API 
- Everyone: fix integration issues — budget half the day for this

#### Day 5 — Real-time + frontend
- P1: WebSocket real-time messages, unread, typing, online/offline + chat pages
- P2: Profile pages fully wired + responsive pass
- P3: WebSocket client in chat frontend + responsive pass on all pages
  
#### Day 6 — Integration + fixes
- Run every user flow end-to-end as a group
- Drop DB → run seeder → verify recommendations work with 100 users
- Fix cross-area bugs
- Verify 404s for unauthorized access
- Check mobile on all pages

#### Day 7 — Buffer + README
- Fix anything from Day 6
- README: setup, how to seed, how to drop and reload DB
- Final check of every requirement

## Rules to Avoid Stepping On Each Other

- P1 ships JWT middleware end of Day 2 — P2 and P3 are blocked without it
- P3 ships seeder by end of Day 3 — nobody can test recommendations without users
- Frontend uses mock data until the real endpoint exists — don't wait, keep moving
- Shared api/ folder in frontend — one person writes a fetch call, everyone uses it
- Feature branch → PR → one review → merge same day — don't let PRs sit overnight
- Daily 15-min sync — catch blockers before they cost half a day