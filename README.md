# AI App Generator Platform

A metadata-driven application runtime that instantly converts JSON configurations into fully working, full-stack React applications with a generated PostgreSQL backend.

## 🚀 The Vision

This project is NOT a traditional CRUD app. It is an **Early-Stage Platform Engine**. 

Instead of writing custom API routes and React components for every new data model (like a typical Next.js application), this platform provides a **Runtime Engine** that dynamically generates the backend APIs, Zod validation schemas, and frontend UI strictly based on a central JSON configuration.

You define a `Model` and a `View` in the Builder, and the Runtime immediately provides a working application.

## 🏗️ Core Architecture & Tradeoffs

The architecture was designed to answer one primary question: *How do we make arbitrary user configurations safe, scalable, and fast?*

### 1. Document-Relational Hybrid Database
**Tradeoff:** Rather than executing raw DDL (`CREATE TABLE`) for every user-defined model (which is dangerous, slow, and hard to migrate), we use a Hybrid architecture.
**Implementation:** We have a strict `App` table and a `Record` table. The `Record` table contains `appId`, `modelName`, and a `data JSONB` column.
**Why:** PostgreSQL's JSONB is incredibly fast and indexable. It allows absolute schema flexibility without compromising on relational integrity or requiring constant database migrations.

### 2. Validation-First Backend Engine
**Tradeoff:** If the database accepts arbitrary JSON, how do we prevent garbage data?
**Implementation:** The backend features a dynamic `validation-engine.ts`. It intercepts incoming payloads, reads the AppConfig, compiles a strict Zod schema on-the-fly, and scrubs the data *before* it touches PostgreSQL.
**Why:** It guarantees runtime safety and prevents malicious payload injections.

### 3. State Decoupling (The Zustand Builder)
**Tradeoff:** Building a JSON configuration editor using standard React `useState` leads to devastating performance bottlenecks due to cascading re-renders.
**Implementation:** The Builder Platform uses `Zustand` to hold a decoupled `draftConfig`. Deeply nested field editors interact directly with the store slice.
**Why:** The UI remains blisteringly fast, and we gain native "Unsaved Changes" detection and rollback capabilities.

### 4. Workflow Automation Dispatcher
**Implementation:** A fully decoupled Event Dispatcher (`src/lib/workflows/dispatcher.ts`). When the CRUD service creates a record, it fires an async event.
**Why:** It ensures that if a webhook or an audit logger fails, it *never* rolls back the successful primary database transaction or blocks the API response time.

## 🌟 Feature Matrix

| Feature | Implementation | Description |
|---------|---------------|-------------|
| **Dynamic Backend** | Next.js API Routes | Generic `/api/runtime/[app]/[model]` interceptors. |
| **Visual Builder** | Zustand + Tailwind | No-code interface to define Models, Fields, and Views. |
| **Live Preview** | Isolated React Context | Instant preview injected from draft state without DB hits. |
| **Security** | Auth.js (NextAuth v5) | Protected routes, User-scoped DB transactions. |
| **Performance** | Next.js `unstable_cache` | DB-free config resolution on the hot path. |
| **Resilience** | Global Error Boundaries | Graceful degradation if a referenced model is deleted. |
| **Extensibility**| Workflow Dispatcher | Event-driven async hooks (Audit Logs, Webhooks). |
| **Ingestion** | Partial-Failure CSV | Processes batch imports, skipping invalid rows safely. |
| **Portability** | App Export API | Download your architecture as versioned JSON. |

## 🧠 Engineering Q&A (Reviewer Guide)

**Q: Why JSONB over dynamically generating Postgres tables?**
A: Executing DDL statements per user breaks multi-tenant scalability, makes backups a nightmare, and introduces massive SQL injection risks. JSONB in modern Postgres provides near-native query performance with `GIN` indexing, allowing thousands of tenant schemas to coexist safely in a single logical table structure.

**Q: Why Route Group isolation?**
A: Next.js allows `/(builder)` and `/[appSlug]` at the root level. This completely severs the bundle. The heavy Zustand state logic and layout shifts of the Builder do not bloat the extremely lightweight, high-performance runtime client serving the dynamic apps.

**Q: Why async workflow dispatching?**
A: Systems design rule: Never tie primary transaction success to an external system's reliability. If we run webhooks synchronously during the CRUD insert, a slow third-party API will hold our database connection hostage and timeout the Next.js Serverless function.

## 🛠️ Setup Instructions & Deployment Validation

### 1. Prerequisites
- Node.js 18+
- PostgreSQL (Local or Neon/Supabase)

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
# PostgreSQL Connection URL
DATABASE_URL="postgresql://user:password@localhost:5432/app_generator"
AUTH_SECRET="your-secure-random-string"
```

### 3. Installation
```bash
npm install
npx prisma db push
npm run dev
```

### 4. Deployment Checklist
- [x] Vercel Serverless Functions compatible.
- [x] `unstable_cache` enabled for configuration reads.
- [x] Auth.js `AUTH_URL` and `AUTH_SECRET` correctly mapped in Vercel.
- [x] Prisma adapter uses connection pooling (`pgbouncer` equivalent in Neon).
# Ai-App-Generator  
