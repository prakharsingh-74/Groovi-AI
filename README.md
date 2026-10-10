# Groovi AI - Autonomous AI Agentic Platform

Groovi AI is a full-stack, state of the art AI Agent Configuration & Execution Platform. It enables users to create, configure, and schedule autonomous agents capable of performing web research, executing multi-step tasks, automating browser interactions, and integrating across modern workspace tools.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router, Server Components & API Routes) |
| **Styling** | Vanilla CSS / TailwindCSS + Radix UI + Lucide Icons |
| **Auth** | Clerk Authentication (SaaS User Management) |
| **Database** | Neon Serverless PostgreSQL |
| **ORM** | Drizzle ORM |
| **AI Model** | Google Gemini (Gemini 2.5 Flash via `@google/genai` SDK) |
| **Web Browser Access** | Browserbase (Headless cloud browser automation & scraping) |
| **Integrations** | SERP API, Google Native Search, Gmail, Slack, Notion, GitHub |

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (Next.js Client Components)"]
        User["User / Web App"]
        PromptBox["Prompt Box Input"]
        QuestionsUI["AIAgentQuestions Wizard"]
    end

    subgraph Backend ["Backend API & AI Engine"]
        ConfigRoute["POST /api/agent/configure"]
        GeminiEngine["Google Gemini 2.5 Flash"]
        SystemPrompt["AgentConfigSystemPrompt"]
    end

    subgraph Database ["Persistence Layer"]
        NeonDB[("Neon Serverless Postgres")]
        Drizzle["Drizzle ORM"]
        ToolsTable[("Tools Table")]
    end

    subgraph Tools ["Agent Tooling Engine (Whole Web Access)"]
        SERP["SERP Search API"]
        WebSearch["Google Web Search"]
        Browserbase["Browserbase Automation"]
        Integrations["Gmail / Slack / Notion / GitHub"]
    end

    User --> PromptBox
    PromptBox -->|Submit Prompt| ConfigRoute
    ConfigRoute -->|Fetch Available Tools| Drizzle
    Drizzle --> ToolsTable
    ToolsTable --> NeonDB

    ConfigRoute -->|Build System Prompt + Prompt + Tools| GeminiEngine
    GeminiEngine -->|Structured Output Schema| ConfigRoute

    ConfigRoute -->|If status = needs_clarification| QuestionsUI
    QuestionsUI -->|User Answers Questions| PromptBox

    ConfigRoute -->|If status = ready| ExecutableAgent["Ready Agent Config"]
    ExecutableAgent --> Tools
    Tools --> SERP & WebSearch & Browserbase & Integrations
```

---

## 🔄 Agent Lifecycle & Configuration Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as CreateAgent (Next.js)
    participant API as POST /api/agent/configure
    participant DB as Neon DB (Drizzle)
    participant AI as Gemini 2.5 Flash

    User->>UI: Types goal (e.g. "Find latest AI developer jobs")
    UI->>API: Sends initial prompt
    API->>DB: Queries active tools list (SERP, Browserbase, Gmail, etc.)
    DB-->>API: Returns available tools
    API->>AI: Prompts Gemini with AgentConfigSystemPrompt + Available Tools
    
    alt Needs Clarification
        AI-->>API: Returns { status: "needs_clarification", clarificationQuestions: [...] }
        API-->>UI: Sends question list
        UI->>User: Displays step-by-step interactive questionnaire
        User->>UI: Answers questions (e.g. Location, Tech Stack)
        UI->>API: Re-posts original prompt + stringified answers
        API->>AI: Prompts Gemini with updated context
    end

    AI-->>API: Returns { status: "ready", config: { name, instructions, tools, skills, schedule, outputFormat } }
    API-->>UI: Delivers executable agent configuration
    UI->>User: Displays ready agent configuration
```

---

## 🛠️ Tools Integrated

1. **SERP API**: Retrieves structured search engine results, news, titles, and snippets.
2. **Web Search**: Finds real-time information across the web.
3. **Browserbase**: Provides agents with cloud-hosted headless browsers to navigate sites, bypass paywalls, click buttons, and scrape complex dynamic web apps.
4. **Gmail Integration**: Reads emails and sends automated updates/alerts.
5. **Slack Integration**: Posts reports and notifications directly into team channels.
6. **Notion Integration**: Saves research notes and updates database tables.
7. **GitHub Integration**: Reads repositories, manages issues, and tracks pull requests.

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js 18+
- Neon PostgreSQL Database account
- Google Cloud Gemini API key
- Clerk SaaS Auth account

### 2. Environment Variables Setup
Create a `.env` file in the root directory:

```env
# Neon Serverless Postgres Database (Drizzle ORM)
DATABASE_URL=postgresql://user:password@ep-cool-db.us-east-2.aws.neon.tech/neondb?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Google Cloud Gemini API Key
GOOGLE_CLOUD_GEMINI_API_KEY=AIzaSy...
```

### 3. Install Dependencies & Run Database Migrations
```bash
npm install
npx drizzle-kit push
```

### 4. Seed Tools Database
Run the seed migration in `db/migrations/001.sql` against your Neon Postgres database.

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Demo Video
https://drive.google.com/file/d/1MRSRZMq8i_-yH-W5wdQT1iua0FI84nCi/view?usp=sharing
