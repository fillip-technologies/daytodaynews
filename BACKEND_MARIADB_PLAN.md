# DayTodayNews — Backend Architecture & MariaDB Setup Guide

This document contains the complete setup commands, database configuration, schema design, and step-by-step roadmap for running the backend co-located in this repository using a local MariaDB/MySQL database.

---

## 1. MariaDB Setup with `pkexec`

MariaDB is installed and active on this system, listening on `127.0.0.1:3306`.
To create the database and dedicated user credentials, run the following commands with `pkexec` (which triggers a Polkit authentication prompt):

```bash
# 1. Create the database with UTF-8 support
pkexec mariadb -e "CREATE DATABASE IF NOT EXISTS daytodaynews CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Create the dedicated database user
pkexec mariadb -e "CREATE USER IF NOT EXISTS 'daytodaynews_user'@'localhost' IDENTIFIED BY 'daytodaynews_secret_2026';"

# 3. Grant privileges on the new database to the application user
pkexec mariadb -e "GRANT ALL PRIVILEGES ON daytodaynews.* TO 'daytodaynews_user'@'localhost';"

# 4. Also grant privileges to the current local OS user ('shadow') for convenient CLI administration
pkexec mariadb -e "GRANT ALL PRIVILEGES ON daytodaynews.* TO 'shadow'@'localhost';"

# 5. Apply the privilege changes
pkexec mariadb -e "FLUSH PRIVILEGES;"
```

### Verification Command
Test that the user can connect and see the database:
```bash
mariadb -u daytodaynews_user -p'daytodaynews_secret_2026' -e "SHOW DATABASES LIKE 'daytodaynews';"
```

---

## 2. Environment Variables (`.env`)

Add the following to `.env` in the project root:

```env
# Local MariaDB connection string
DATABASE_URL="mysql://daytodaynews_user:daytodaynews_secret_2026@127.0.0.1:3306/daytodaynews"
```

---

## 3. Prisma Configuration Changes

### A. Update `prisma/schema.prisma`
Switch `provider` from `postgresql` to `mysql`:

```prisma
datasource db {
  provider = "mysql"
}

generator client {
  provider = "prisma-client-js"
}
```

### B. Update `src/lib/prisma.ts`
Remove `@prisma/adapter-pg` dependencies and use the standard singleton pattern:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### C. Dependency Cleanup
Remove PostgreSQL packages:
```bash
npm uninstall @prisma/adapter-pg @types/pg pg
```

---

## 4. Prisma Schema Design

```prisma
datasource db {
  provider = "mysql"
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  EDITOR
  AUTHOR
  USER
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum SubmissionStatus {
  NEW
  READ
  REPLIED
  ARCHIVED
}

enum PitchStatus {
  PENDING
  REVIEWED
  ACCEPTED
  REJECTED
}

enum SubscriberStatus {
  ACTIVE
  UNSUBSCRIBED
}

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String
  role      Role      @default(AUTHOR)
  avatar    String?
  bio       String?   @db.Text
  articles  Article[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("users")
}

model Topic {
  id          String    @id @default(cuid())
  slug        String    @unique
  label       String
  description String    @db.Text
  href        String
  icon        String
  tone        String
  articles    Article[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("topics")
}

model Article {
  id            String        @id @default(cuid())
  slug          String        @unique
  title         String        @db.VarChar(255)
  description   String?       @db.Text
  content       String?       @db.LongText
  readTime      Int           @default(5)
  authorName    String
  authorId      String?
  author        User?         @relation(fields: [authorId], references: [id], onDelete: SetNull)
  topicSlug     String
  topic         Topic         @relation(fields: [topicSlug], references: [slug], onDelete: Restrict)
  
  // Cover Art Specification
  coverPattern  String?
  coverTones    String?       // JSON stringified e.g. '["accent-secondary", "pink"]'
  coverIcon     String?
  imageUrl      String?
  imageAlt      String?
  
  // Editorial Flags
  featured      Boolean       @default(false)
  editorsPick   Boolean       @default(false)
  trending      Boolean       @default(false)
  trendingRank  Int?
  
  status        ArticleStatus @default(PUBLISHED)
  viewsCount    Int           @default(0)
  publishedAt   DateTime      @default(now())
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([topicSlug])
  @@index([publishedAt])
  @@index([featured, editorsPick, trending])
  @@map("articles")
}

model NewsletterSubscriber {
  id           String           @id @default(cuid())
  email        String           @unique
  status       SubscriberStatus @default(ACTIVE)
  subscribedAt DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  @@map("newsletter_subscribers")
}

model ContactSubmission {
  id        String           @id @default(cuid())
  name      String
  email     String
  subject   String
  message   String           @db.Text
  status    SubmissionStatus @default(NEW)
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  @@map("contact_submissions")
}

model ContributorPitch {
  id           String      @id @default(cuid())
  name         String
  email        String
  topic        String
  portfolio    String?
  idea         String      @db.VarChar(255)
  message      String      @db.Text
  status       PitchStatus @default(PENDING)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@map("contributor_pitches")
}
```

---

## 5. Mock Data Seeding Plan

A script (`scripts/seed.ts`) will be created to read from:
- `src/data/topics.ts` -> insert into `Topic` table.
- `src/data/articles.ts` -> insert into `Article` table (associating `editorsPicks`, `trendingArticles`, and `featuredArticles` with appropriate boolean flags).
- Default seed author: "Shruti Singh" inserted into `User` table.

Command to run:
```bash
npm run db:seed
```

---

## 6. Full-Stack Endpoints & Integration

### A. Data Access Layer (`src/lib/articles.ts`)
- Replace the static array filter/slice functions with Prisma queries.
- Keep the exact same function signatures (`getTopics`, `getEditorsPicks`, `getLatestArticles`, `getTrendingArticles`, `getBlogArticles`, `getCategoryListing`, `searchArticles`) so all existing UI components work without code changes.

### B. New Article Page (`src/app/articles/[slug]/page.tsx`)
- Render article header, cover art/image, metadata, author, and full content.
- Generates dynamic SEO metadata (`generateMetadata`).
- Automatically increments `viewsCount`.

### C. Server Actions & Form Wiring
- `src/actions/newsletter.ts` -> wire into `src/components/home/Newsletter.tsx`.
- `src/actions/contact.ts` -> wire into `src/components/static/ContactForm.tsx`.
- `src/actions/contribute.ts` -> wire into `src/components/static/ContributorForm.tsx`.

### D. REST Route Handlers (`src/app/api/...`)
- `GET /api/articles` (filtering, pagination, search).
- `GET /api/articles/[slug]` (single article retrieval).
- `POST /api/newsletter` (external/client newsletter subscriptions).
- `POST /api/contact` (contact form submission).
- `POST /api/contribute` (contributor pitch submission).


---

## 7. Admin Portal & User Management System

### Default Credentials
- **Super Admin**: `admin@daytodaynews.com` | Password: `Admin@2026!`
- **Staff Editor**: `shruti@daytodaynews.com` | Password: `Author@2026!`

### Admin Portal Routes
- `/admin/login` — Staff Authentication Login page
- `/admin` — High-level Platform & Editorial Metrics Dashboard
- `/admin/users` — Staff & User Management (Role promotion, password reset, create, delete)
- `/admin/articles` — Content CMS (Full article listing with search, filtering, and delete)
- `/admin/articles/new` — Markdown story composer with live preview
- `/admin/articles/[id]/edit` — Article editor with editorial switches (Featured, Pick, Trending)
- `/admin/inbox` — Submissions manager (Contact inquiries, Contributor pitches, Newsletter subscribers)

### Testing Command
```bash
npm run test:admin
```
