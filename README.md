# DayTodayNews — Modern Fullstack Technology & Insights Platform

A high-performance publication platform and content management system built with **Next.js 16 (App Router & Turbopack)**, **React 19**, **Tailwind CSS v4**, **MariaDB/MySQL**, and **Prisma ORM**.

DayTodayNews delivers technology news, AI & automation case studies, software engineering deep-dives, and business growth insights, paired with a full administrative CMS workspace.

---

## 🌟 Key Features

### 1. Reader & Public Experience
- **Dynamic Content & Exploration**: Live category listings (`/category/[category]`), global search (`/search`), and article exploration (`/blog`).
- **Markdown Article Reader (`/articles/[slug]`)**: Dynamic typography, read times, author bylines, and responsive SVG/Canvas cover art.
- **Dynamic Categories**: Category pages render featured lead stories, paginated article grids, and live "Most Read" sidebars ranked by database views.
- **Interactive Forms**: Newsletter subscriptions, contact inquiries, and contributor pitches with instant automated email confirmations.

### 2. Administrative CMS Workspace (`/admin`)
- **Dashboard Overview (`/admin`)**: Real-time publication metrics, article counts, category breakdowns, and submission tallies.
- **Articles CMS (`/admin/articles`)**: Full CRUD with search, category filters, draft/published/archived status tabs, 1-click toggles (Featured, Editor's Pick, Trending), article cloning, and a Markdown writing interface with live split-screen preview.
- **Categories & Topics CMS (`/admin/categories`)**: Create, edit, and delete topics with auto-slug generation, custom decorative tones, icon selectors, and foreign-key deletion guards.
- **User & Staff Management (`/admin/users`)**: Role-based access control (`ADMIN`, `EDITOR`) with secure bcrypt password management.
- **Submissions Inbox (`/admin/inbox`)**: Unified leads dashboard for reviewing contributor pitches and contact form messages.

### 3. Architecture & Security
- **Strict Server Isolation**: All database queries (`@prisma/client`), SMTP credentials, and JWT secrets execute strictly on the server; zero backend code or credentials are leaked to the client browser.
- **Edge Route Protection**: Next.js middleware guards `/admin/*` using encrypted, HTTP-Only `admin_session` JWT cookies.
- **Zero CORS Needed**: Frontend and backend run co-located on the same origin.

---

## 🏗️ Architecture & Folder Structure

```text
daytodaynews/
├── prisma/                          # Database schema & migrations
│   └── schema.prisma                # MariaDB models (User, Topic, Article, Leads, etc.)
│
├── scripts/                         # Database operations & test suites
│   ├── db-check.ts                  # MariaDB connection & table inspection
│   ├── seed.ts                      # Initial database seeder (admin, authors, 7 topics, 29 articles)
│   ├── test-admin.ts                # Verification suite for auth, user CRUD, & article CRUD
│   ├── test-backend.ts              # Verification suite for queries, newsletter, & contact actions
│   ├── test-category-pages.ts       # Verification suite for all 7 dynamic category pages
│   └── test-mail.ts                 # Verification suite for Gmail SMTP email dispatch
│
├── src/
│   ├── actions/                     # Next.js Server Actions ("use server" backend mutations)
│   │   ├── articles.ts              # Article CRUD, publish toggle, flag toggle, duplicate
│   │   ├── auth.ts                  # Admin login, session creation, and logout
│   │   ├── categories.ts            # Category/Topic CRUD with foreign key safety guards
│   │   ├── contact.ts               # Contact form handler + SMTP alert dispatch
│   │   ├── contribute.ts            # Contributor pitch handler + SMTP alert dispatch
│   │   ├── inbox.ts                 # Submissions review, status updates, and deletions
│   │   ├── newsletter.ts            # Newsletter subscriber signup + welcome email
│   │   └── users.ts                 # Staff & author management (Admin/Editor/Author roles)
│   │
│   ├── app/                         # Next.js App Router (Pages, layouts & endpoints)
│   │   ├── admin/                   # Secure Admin Portal (Protected by middleware)
│   │   │   ├── articles/            # Articles CMS (List, search, filter, status toggles)
│   │   │   │   ├── [id]/edit/       # Article editing page
│   │   │   │   ├── new/             # Article creation page
│   │   │   │   ├── ArticleForm.tsx  # Markdown editor, preview & cover art designer
│   │   │   │   └── ArticlesList.tsx # Interactive articles table
│   │   │   ├── categories/          # Category CMS (Add, edit, delete, tones & icons)
│   │   │   │   ├── CategoryManager.tsx # Interactive category table & modals
│   │   │   │   └── page.tsx         # Categories page server component
│   │   │   ├── inbox/               # Inbound leads & pitches CMS
│   │   │   ├── login/               # Admin sign-in screen
│   │   │   ├── users/               # Staff & user profile management
│   │   │   ├── AdminNav.tsx         # Sidebar navigation for admin workspace
│   │   │   ├── layout.tsx           # Admin layout wrapper
│   │   │   └── page.tsx             # Admin dashboard analytics & metric cards
│   │   │
│   │   ├── api/                     # Public REST API Route Handlers
│   │   │   ├── articles/            # GET /api/articles (list, search, filter)
│   │   │   │   └── [slug]/          # GET /api/articles/:slug
│   │   │   ├── contact/             # POST /api/contact
│   │   │   └── newsletter/          # POST /api/newsletter
│   │   │
│   │   ├── articles/[slug]/         # Dynamic public article reader page (Markdown rendered)
│   │   ├── category/[category]/     # Dynamic category page (Lead story, grid & most-read sidebar)
│   │   ├── blog/                    # Main insights explorer (/blog)
│   │   ├── search/                  # Global search results page
│   │   ├── about/                   # About DayTodayNews
│   │   ├── contact/                 # Contact & partnership inquiry page
│   │   ├── write-for-us/            # Contributor pitch submission page
│   │   ├── privacy-policy/          # Legal privacy policy
│   │   ├── terms/                   # Terms of service
│   │   ├── disclaimer/              # Platform disclaimer
│   │   ├── layout.tsx               # Root site layout (Header, Footer, Metadata)
│   │   ├── page.tsx                 # Public homepage (Hero, trending, picks, topics)
│   │   └── not-found.tsx            # Custom 404 page
│   │
│   ├── components/                  # Reusable UI & Presentational Components
│   │   ├── article/                 # ArticleContent.tsx (Custom styled markdown reader)
│   │   ├── blog/                    # ArticleCard, CoverArt, FeaturedArticle, BlogExplorer
│   │   ├── category/                # CategoryHeader, CategoryArticles
│   │   ├── home/                    # Hero, TrendingPosts, LatestArticles, Newsletter
│   │   ├── layout/                  # Header, Footer, DesktopNav, MobileNav, Logo
│   │   ├── search/                  # SearchInput, SearchFilters, SearchResults
│   │   ├── static/                  # ContactForm, ContributorForm, LegalPageLayout
│   │   └── ui/                      # Icon (SVG icons), Pagination, Sheet (mobile drawer)
│   │
│   ├── config/                      # Navigation configurations
│   │   ├── navigation.ts            # Header navigation links & category slugs
│   │   └── footerNavigation.ts      # Footer columns & sitemap
│   │
│   ├── data/                        # Static seed & fallback datasets
│   │   ├── articles.ts              # Initial seed articles
│   │   ├── categories.ts            # Category metadata & legacy alias mappings
│   │   ├── featuredArticles.ts      # Featured story definitions
│   │   └── topics.ts                # Base topics dataset
│   │
│   ├── lib/                         # Shared backend utilities & core services
│   │   ├── articles.ts              # Database content queries (listings, popular, slugs)
│   │   ├── auth.ts                  # Password hashing (bcrypt) & JWT cookie sessions
│   │   ├── mail.ts                  # Nodemailer Gmail SMTP client & email templates
│   │   ├── prisma.ts                # MariaDB Prisma client singleton with driver adapter
│   │   ├── blog.ts                  # Blog filtering & query parsers
│   │   ├── cn.ts                    # ClassName merge helper (clsx + twMerge)
│   │   ├── format.ts                # Date formatting & user avatar initials
│   │   ├── pagination.ts            # Pagination calculations
│   │   └── tones.ts                 # Decorative color tone tokens (primary, pink, accent)
│   │
│   ├── middleware.ts                # Route protection (Guards /admin/* using JWT cookies)
│   └── types/                       # Shared TypeScript interface definitions
│       └── article.ts               # Article, CoverSpec, Tone, and Category types
│
├── .env                             # Environment secrets (DATABASE_URL, SMTP, JWT_SECRET)
├── .env.example                     # Environment configuration template
├── BACKEND_MARIADB_PLAN.md          # Architectural plan & MariaDB setup documentation
├── next.config.ts                   # Next.js configuration
├── package.json                     # Dependencies, build scripts & test commands
└── tsconfig.json                    # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20 or higher
- **MariaDB / MySQL**: Running locally on `127.0.0.1:3306`

### 2. Environment Variables (`.env`)
Create a `.env` file in the project root:

```env
# Database connection string (MariaDB / MySQL)
DATABASE_URL="mysql://USER:PASSWORD@127.0.0.1:3306/daytodaynews"

# Mail (SMTP) - Gmail configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME="your-smtp-username"
MAIL_PASSWORD="your-smtp-app-password"
MAIL_FROM_ADDRESS="noreply@example.com"
MAIL_FROM_NAME="FBOS"

# Authentication Session Secret
JWT_SECRET="<random 48+ chars: openssl rand -base64 48>"
```

### 3. Database Initialization
Create the database and seed initial topics and articles:

```bash
# 1. Push Prisma schema to MariaDB
npm run db:push

# 2. Seed topics, articles, and staff accounts
npm run db:seed

# 3. Verify connection & article counts
npm run db:check
```

---

## 🔑 Seed Login Credentials (Admin & Staff)

When you initialize and seed the database (`npm run db:seed`), the following staff accounts are created:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin (`ADMIN`)** | `admin@daytodaynews.com` | `Admin@2026!` | **Full Master Access**: Users CRUD, articles, categories, settings, and submissions inbox |
| **Editorial Director (`EDITOR`)** | `shruti@daytodaynews.com` | `Author@2026!` | **Editorial Access**: Articles CRUD, category curation, pitches & inbox management |

### How to Sign In:
1. Navigate to the login portal: **[http://localhost:3000/admin/login](http://localhost:3000/admin/login)**
2. Enter the email and password above.
3. Upon authentication, you will be redirected to the Admin Workspace at **`/admin`** with access to:
   - **Articles CRUD (`/admin/articles`)**: Search, multi-column sorting, pagination, and status toggles.
   - **Categories & Topics (`/admin/categories`)**: Manage taxonomy, URL slugs, decorative tones, and icons.
   - **Staff & Users (`/admin/users`)**: Create and manage `ADMIN` and `EDITOR` accounts.
   - **Submissions Inbox (`/admin/inbox`)**: Review contact inquiries, contributor pitches, and subscribers.
   - **Site Configuration (`/admin/settings`)**: Configure top navigation categories.

> **Note**: Public readers do not need to log in to read articles, search, submit story pitches at `/write-for-us`, contact the newsroom, or subscribe to newsletters. All staff and editorial management operates via the `/admin` portal.

---

## 🧪 Automated Verification & Test Scripts

Run automated verification suites directly from npm:

```bash
# Verify database connection, queries, and submission forms
npm run test:backend

# Verify admin auth, user management, and article/category CRUD
npm run test:admin

# Verify dynamic loading across all 7 category pages
npm run test:categories

# Verify Gmail SMTP email delivery
npm run test:mail
```

---

## 💻 Development & Production

```bash
# Start local development server (Turbopack)
npm run dev

# Run production build & type checks
npm run build

# Start production server
npm run start
```