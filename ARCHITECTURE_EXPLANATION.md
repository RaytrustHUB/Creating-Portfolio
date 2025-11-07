# Vercel Project Architecture - Server & CRUD Requests

## 🏗️ Server Architecture

Your project uses **Vercel Serverless Functions** - there's no traditional "always-on" server. Instead:

### Server Location
- **`api/[...].ts`** - Vercel serverless function handler (catch-all route)
- **`api/_app.ts`** - Express app setup for serverless
- **`server/routes.ts`** - All CRUD route definitions
- **`db/index.ts`** - Database connection (Neon serverless)

### How It Works

```
Frontend (React) → API Request → Vercel Serverless Function → Express App → Routes → Database
```

## 📡 Request Flow

### 1. Frontend Makes Request
```typescript
// Example from TaskManager.tsx
const response = await fetch("/api/tasks");
```

### 2. Vercel Routes Request
- Vercel sees `/api/tasks` and routes it to `api/[...].ts` (serverless function)
- The `[...].ts` means it's a catch-all route for all `/api/*` requests

### 3. Serverless Function Handler
```typescript
// api/[...].ts
export default function handler(req, res) {
  // Wraps Express app call
  app(req, res);
}
```

### 4. Express App Processes Request
```typescript
// api/_app.ts
const app = express();
// Middleware (CORS, body parsing)
// Routes registered from server/routes.ts
```

### 5. Route Handler Executes
```typescript
// server/routes.ts
app.get("/api/tasks", async (req, res) => {
  const allTasks = await db.select().from(tasks);
  res.json(allTasks);
});
```

### 6. Database Query
```typescript
// db/index.ts
export const db = drizzle(DATABASE_URL, { schema });
// Uses Neon serverless (optimized for Vercel)
```

## 🔄 CRUD Operations

### CREATE (POST)
```typescript
// Frontend
fetch("/api/tasks", {
  method: "POST",
  body: JSON.stringify({ title: "New Task" })
});

// Backend (server/routes.ts)
app.post("/api/tasks", async (req, res) => {
  const [task] = await db.insert(tasks).values(req.body).returning();
  res.status(201).json(task);
});
```

### READ (GET)
```typescript
// Frontend
fetch("/api/tasks");

// Backend
app.get("/api/tasks", async (req, res) => {
  const allTasks = await db.select().from(tasks);
  res.json(allTasks);
});
```

### UPDATE (PUT)
```typescript
// Frontend
fetch(`/api/tasks/${id}`, {
  method: "PUT",
  body: JSON.stringify({ title: "Updated Task" })
});

// Backend
app.put("/api/tasks/:id", async (req, res) => {
  const [task] = await db
    .update(tasks)
    .set(req.body)
    .where(eq(tasks.id, req.params.id))
    .returning();
  res.json(task);
});
```

### DELETE
```typescript
// Frontend
fetch(`/api/tasks/${id}`, { method: "DELETE" });

// Backend
app.delete("/api/tasks/:id", async (req, res) => {
  await db.delete(tasks).where(eq(tasks.id, req.params.id));
  res.json({ success: true });
});
```

## 🗂️ File Structure

```
project/
├── api/                    ← Vercel Serverless Functions
│   ├── [...].ts           ← Catch-all handler (routes all /api/*)
│   └── _app.ts            ← Express app setup
│
├── server/                 ← Route definitions (shared code)
│   └── routes.ts          ← All CRUD routes defined here
│
├── db/                     ← Database layer
│   ├── index.ts           ← Database connection
│   └── schema.ts          ← Database schema
│
└── client/                 ← Frontend React app
    └── src/
        └── components/
            └── projects/
                └── TaskManager.tsx  ← Makes fetch() requests
```

## 🔑 Key Points

1. **No Traditional Server**: Uses Vercel serverless functions (scales automatically)
2. **Express in Serverless**: Express app wrapped in serverless function handler
3. **Shared Routes**: `server/routes.ts` contains all API route definitions
4. **Database**: Neon serverless (optimized for serverless environments)
5. **Frontend**: React app makes standard `fetch()` requests to `/api/*` endpoints

## 🌐 Deployment

- **Frontend**: Built to `dist/public/` and served as static files
- **API**: `api/` folder becomes serverless functions on Vercel
- **Routes**: All `/api/*` requests go to `api/[...].ts` → Express app → `server/routes.ts`

## 📝 Example: Task CRUD Flow

1. User clicks "Add Task" in React app
2. `TaskManager.tsx` calls `fetch("/api/tasks", { method: "POST", ... })`
3. Vercel routes to `api/[...].ts` serverless function
4. Handler calls Express app (`api/_app.ts`)
5. Express app matches route to `app.post("/api/tasks", ...)` in `server/routes.ts`
6. Route handler queries database using Drizzle ORM
7. Response sent back to frontend
8. React Query updates UI with new task

