# Groovi AI

> **Autonomous AI Workforce Execution Engine** — Configure, connect, and schedule multi-tool background agents across Gmail, Slack, GitHub, Sheets, and Notion with durable execution, zero drift, and full observability.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Inngest](https://img.shields.io/badge/Inngest-Durable_Execution-violet?style=flat)](https://www.inngest.com/)
[![Neon](https://img.shields.io/badge/Neon-Serverless_Postgres-00e599?style=flat&logo=postgresql)](https://neon.tech/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth_%26_Billing-6c47ff?style=flat)](https://clerk.com/)
[![Neatlogs](https://img.shields.io/badge/Neatlogs-Observability-orange?style=flat)](https://neatlogs.com/)

---

## Features

- **Natural Language Agent Builder**: Type your operational objective in plain English. Groovi AI analyzes prompt ambiguity, asks targeted clarification questions, and configures an autonomous execution blueprint (system instructions, schedule, and tool permissions).
- **Durable Scheduling & Autonomy (Inngest)**: Scheduled agents run automatically on daily, weekly, or custom cron intervals. Inngest ensures zero execution drift, timezone normalization, and automatic retries on network failures without duplicating side-effects.
- **Zero-Code Tool Bindings (Composio)**: Connect agents to your real SaaS ecosystem with one-click OAuth 2.0 (Gmail, Google Calendar, Google Sheets, Slack, GitHub, Notion, Supabase, and live web SERP search).
- **Web Automation (Browserbase)**: Headless browser automation and web extraction for market research and competitive intelligence.
- **Pre-Configured Production Templates**: Deploy battle-tested agent workflows in seconds, including:
  - *AI CFO & Burn Rate Sentinel* (Google Sheets + Slack)
  - *Executive Inbox & Morning Standup* (Gmail + Google Calendar + Slack)
  - *Competitive Intelligence Scout* (SERP Search + Browserbase)
  - *GitHub Issue Triage & Reviewer* (GitHub + Slack)
- **Clerk Tiered Billing**:
  - **Free Tier**: Up to 3 autonomous agents, standard execution queue, custom prompt builder, and live tool bindings.
  - **Pro Tier ($40/mo)**: Unlimited agents, full access to 8+ production templates, priority execution queue, and dedicated support.
- **Deep LLM Observability (Neatlogs)**: Real-time telemetry tracking token consumption, model costs, step latencies, tool execution payloads, and multi-model fallbacks.
- ### Agent might get fail while creating response as the free API keys has been used.

---

## Architecture Overview

```mermaid
flowchart TD
    User["User / Browser Client"] --> Landing["Landing Page (app/page.tsx)"]
    User --> Dash["Dashboard (app/dashboard)"]
    
    subgraph AuthAndBilling ["Authentication & Billing"]
        Dash --> Clerk["Clerk SDK (@clerk/nextjs)\n• User Authentication\n• PricingTable ($0 Free vs $40 Pro)"]
    end

    subgraph AgentEngine ["Agent Orchestration"]
        Dash --> ConfigAPI["/api/agent/configure"]
        ConfigAPI --> Gemini["Google Gemini (2.5 Flash / Pro)\nStructured Config & Clarification"]
        ConfigAPI --> Neon[("Neon Serverless Postgres\n(Drizzle ORM)")]
    end

    subgraph DurableRuntime ["Durable Background Scheduling"]
        Neon --> InngestScheduler["Inngest Event Engine\n(inngest/agent-runner)"]
        InngestScheduler --> Runner["Durable Agent Execution"]
    end

    subgraph ToolsAndTelemetry ["Tool Executions & Observability"]
        Runner --> Composio["Composio Toolkits\n(Sheets, Slack, Gmail, GitHub, Notion)"]
        Runner --> Browserbase["Browserbase\n(Headless Web Scraping)"]
        Runner -.-> Neatlogs["Neatlogs SDK\n(Token tracing, cost, & latency metrics)"]
    end
```

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router)** | Modern full-stack React framework with server components and edge routing |
| **Language** | **TypeScript 5** | Strict end-to-end type safety |
| **Styling** | **Tailwind CSS v4 & Radix UI** | High-contrast dark technical UI, components, and animations |
| **Database** | **Neon Serverless PostgreSQL** | Cloud-native serverless Postgres with instant branching |
| **ORM** | **Drizzle ORM** | Lightweight, type-safe schema modeling and migrations |
| **Authentication** | **Clerk** | Seamless user session management, middleware guards, and SSO |
| **Billing** | **Clerk Billing** | Native `<PricingTable />` integration enforcing Free (3 agents) vs Pro ($40/mo) |
| **Background Jobs** | **Inngest** | Event-driven, durable step execution engine for cron and scheduled agent workflows |
| **AI Reasoning** | **Google Gemini (`@google/genai`)** | High-speed structured JSON generation and agent synthesis |
| **AI Fallback** | **Groq / OpenAI** | Secondary fallback reasoning providers |
| **Tool Integration** | **Composio SDK** | OAuth 2.0 handshake and execution layer for third-party SaaS integrations |
| **Web Automation** | **Browserbase SDK** | Headless cloud browser navigation and web scraping |
| **Observability** | **Neatlogs SDK** | End-to-end LLM telemetry, token counts, and execution latency |

---

## Getting Started

### 1. Prerequisites

Ensure you have the following installed and configured:
- **Node.js**: `v20.x` or higher
- **npm** or **pnpm**
- A **Neon PostgreSQL** database ([console.neon.tech](https://console.neon.tech))
- A **Clerk** account ([clerk.com](https://clerk.com)) with billing enabled
- A **Google Gemini API Key** ([aistudio.google.com](https://aistudio.google.com))
- A **Composio API Key** ([app.composio.dev](https://app.composio.dev))
- A **Neatlogs API Key & Project ID** ([neatlogs.com](https://neatlogs.com))

---

### 2. Installation

Clone the repository and install project dependencies:

```bash
git clone https://github.com/prakharsingh-74/groovi-ai.git
cd groovi-ai
npm install
```

---

### 3. Environment Configuration

Copy the example environment file and populate your keys:

```bash
cp .env.example .env
```

Review your `.env` and verify the required fields:

```env
# Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Neon Database
DATABASE_URL=postgresql://user:password@ep-example.us-east-2.aws.neon.tech/neondb?sslmode=require

# Clerk Authentication & Billing
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# AI Providers
GOOGLE_CLOUD_GEMINI_API_KEY=AIzaSy...
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash

# Integrations & Observability
COMPOSIO_API_KEY=comp_...
NEATLOGS_API_KEY=neat_...
NEATLOGS_PROJECT_ID=proj_...

# Local Inngest
INNGEST_DEV=1
```

---

### 4. Database Setup

Push the Drizzle schema directly to your Neon database:

```bash
npx drizzle-kit push
```

*(Optional: Run `npx drizzle-kit studio` to inspect tables and data visually.)*

---

### 5. Running Locally

Autonomous agent workflows require both the **Inngest Dev Server** (for scheduled background tasks) and the **Next.js Dev Server**.

#### Terminal 1 — Start the Inngest Dev Server:
```bash
npx inngest-cli@latest dev
```
> The Inngest dev dashboard will be accessible at [http://localhost:8288](http://localhost:8288).

#### Terminal 2 — Start the Next.js Application:
```bash
npm run dev
```
> The web application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
groovi-ai/
├── app/
│   ├── (auth)/                     # Clerk sign-in and sign-up pages
│   ├── api/
│   │   ├── agent/
│   │   │   ├── configure/          # Agent creation & deletion API (enforces 3-agent limit)
│   │   │   └── tools/              # Tool connections & Composio APIs
│   │   ├── agent-log/              # Agent run telemetry logs
│   │   ├── inngest/                # Inngest webhook route handler
│   │   └── users/                  # User sync and account status
│   ├── dashboard/
│   │   ├── agents/                 # Agent visual manager & builder
│   │   ├── billing/                # Clerk PricingTable billing page
│   │   ├── integrations/           # Connected OAuth tools & credentials
│   │   ├── templates/              # Verified production templates (Pro paywall)
│   │   └── page.tsx                # Dashboard overview and live status
│   ├── layout.tsx                  # Root layout with ClerkProvider and ThemeProvider
│   └── page.tsx                    # Landing page (Linear / Watermelon UI landing-01)
├── components/
│   ├── custom/agents/              # Agent builder, questionnaire, and cards
│   ├── landing/                    # Modular landing-01 components (Hero, Stats, Bento, Pricing)
│   └── ui/                         # Reusable shadcn/Radix UI components
├── db/
│   ├── index.ts                    # Neon serverless client connection
│   └── schema.ts                   # Drizzle schema (User, AgentConfig, AgentRun, Tool)
├── inngest/
│   ├── client.ts                   # Inngest client configuration
│   └── functions.ts                # Durable background agent runner & cron handler
├── lib/
│   ├── build-agent.ts              # Agent instruction synthesis & model fallback
│   ├── composio.ts                 # Composio client initialization
│   ├── neatlogs.ts                 # Neatlogs instrumentation helper
│   └── browserbase-tool.ts         # Browserbase web scraper integration
└── public/
    ├── logos/                      # Native tool icons (Gmail, Slack, GitHub, Sheets, etc.)
    └── logo.svg                    # Groovi AI brand identity
```

---

## License

This project is licensed under the [MIT License](LICENSE).
