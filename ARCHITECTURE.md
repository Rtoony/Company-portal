# ACME CAD Standards Library - Architecture Strategy

## Current State: Phase 1 (Streamlined Prototype)
The application currently runs as a focused Single Page Application (SPA) using React. Data is mocked via a Service Layer (`dataService.ts`) to simulate latency. Unnecessary tools and widgets have been stripped to provide a clean foundation for migration.

## Target State: Phase 2 (Production PostgreSQL)
The goal is to decouple the UI from the Data Source to support a locally hosted **PostgreSQL** database running on an on-premise server.

### The "Service Layer" Pattern
We strictly adhere to a Service Layer pattern to ensure the React UI never knows *where* the data comes from.

```
[ React UI (App.tsx) ]  <-- calls -->  [ Data Service (dataService.ts) ]  <-- queries -->  [ PostgreSQL (Local) ]
```

### Database Schema (UCCS)
The database is structured around the **Unified Civil Classification System (UCCS)**.
See `db/schema.sql` for the exact table definitions.

1.  **Atomic Tiers:** We do not store "Layer Names". We store the 6 atomic tiers (Discipline, Category, Element, Modifier, Status, Type) and generate names dynamically.
2.  **User Persistence:** User favorites and settings are stored in `user_preferences` and `user_favorites` tables.
3.  **Authentication:** Integration with Windows Authentication (Active Directory) for admin login via `users` table mapping. Use the `username` column to match Windows credentials (e.g., `DOMAIN\user`).

### Database Implementation Steps
1.  Install PostgreSQL 14+ on the local server.
2.  Install the `pgvector` extension for semantic search capabilities.
3.  Run the `db/schema.sql` script to initialize the tables.
4.  Configure the backend service (Node/Express or Go) to connect to this database instance.

### Future Development Instructions
1.  **DO NOT** hardcode data into `App.tsx` or `constants.ts`.
2.  **ALWAYS** route data operations through `services/dataService.ts`.
3.  **MAINTAIN** the SQL schema in `db/schema.sql` as the source of truth for data structure.
4.  **PRESERVE** the "Dark Industrial/Steampunk" aesthetic in the UI components.