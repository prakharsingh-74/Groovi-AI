# Groovi AI

Groovi AI is a platform for creating, configuring, and managing autonomous AI agents. Users can describe their goals in natural language, and the system automatically determines the required skills, tool integrations, and execution schedules.

---

## Features

- **Natural Language Agent Creation**: Describe what you want to achieve, and Groovi AI generates an executable agent specification (objective, skills, instructions, and tools).
- **Interactive Clarification**: If a prompt is ambiguous or lacks critical details, the system asks targeted questions before finalizing the configuration.
- **Tool & App Integrations**: Connects with services via Composio (Google Calendar, GitHub, Gmail, Slack, Notion, Google Sheets, Browserbase, SerpApi) and Entire.io for code repository intelligence.
- **Agent Customization**: Fine-tune agent instructions, manage enabled tools, set recurring execution schedules, and configure output formats.
- **Observability & Checkpoints**: Integrated with neatlogs for latency and multi-model fallback tracing, and Entire.io for git-linked checkpoints and codebase graph memory.

---

## Architecture Overview

```mermaid
flowchart TD
    User["User / Dashboard"] --> NextClient["Next.js Web Client"]
    NextClient --> API["Next.js API Routes"]
    
    subgraph AgentEngine ["Agent Configuration & Execution"]
        API --> ConfigRoute["/api/agent/configure"]
        ConfigRoute --> Gemini["Google Gemini (Reasoning & Schema)"]
        ConfigRoute --> DB[("Neon Serverless Postgres\n(Drizzle ORM)")]
    end

    subgraph Integrations ["Tools & Observability"]
        API --> ToolConnect["/api/agent/tools/connect"]
        ToolConnect --> Composio["Composio Toolkits\n(Calendar, GitHub, Slack, etc.)"]
        ToolConnect --> Entire["Entire.io\n(Code Graph & Checkpoints)"]
        ConfigRoute -.-> Neatlogs["neatlogs (Tracing & Telemetry)"]
    end
```

---

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI primitives, Lucide Icons
- **Database**: Neon Serverless PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **AI / LLM**: Google Gemini (`@google/genai`)
- **Tool Infrastructure**: Composio SDK
- **Code Graph & Versioning**: Entire CLI (`entire-graph`)
- **Telemetry**: neatlogs SDK

---

## Getting Started

### 1. Prerequisites

- Node.js 20+
- A Neon PostgreSQL database instance
- Clerk account for authentication
- Google Gemini API key

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/prakharsingh-74/Groovi-AI.git
cd Groovi-AI
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Neon Postgres)
DATABASE_URL=postgresql://user:password@ep-example.us-east-2.aws.neon.tech/neondb?sslmode=require

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# LLM Providers (Free Google Gemini or Groq)
GOOGLE_CLOUD_GEMINI_API_KEY=AIzaSy...
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-3.8-flash
# Optional: GROQ_API_KEY=gsk_...
# Optional: OPENAI_API_KEY=sk-...

# Integrations
COMPOSIO_API_KEY=...
NEATLOGS_API_KEY=...
NEATLOGS_PROJECT_ID=...
```

### 4. Database Setup

Push the Drizzle database schema to your Neon database:

```bash
npx drizzle-kit push
```

### 5. Run the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── agent/
│   │   │   ├── configure/      # Generates agent specs from prompts
│   │   │   └── tools/          # Tool listing, connection, and Entire APIs
│   │   └── users/              # User syncing and credits
│   ├── (auth)/                 # Clerk authentication routes
│   └── page.tsx                # Main dashboard and agent workspace
├── components/
│   ├── custom/agents/          # Agent creation sheet, cards, question flow
│   └── ui/                     # Reusable UI component primitives
├── db/
│   ├── index.ts                # Neon database client
│   └── schema.ts               # Users, tools, and agent configurations schema
├── lib/
│   ├── composio.ts             # Composio client setup
│   ├── entire.ts               # Entire.io code graph and checkpoint helper
│   ├── get-agent-composio-session.ts
│   └── neatlogs.ts             # neatlogs tracing wrapper
└── data/
    ├── Prompt.tsx              # System prompts for agent configuration
    └── ResponseSchema.ts       # Structured JSON schema definitions
```

---

## License

MIT
