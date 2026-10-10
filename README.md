# 🚀 Groovi AI — Autonomous AI Agent Platform

> Built & Optimized for **neatHack (October 10–12, 2026)**  
> **Track:** *Build an agent that works (literally)*  
> **Official Sponsor Stack:** [`neatlogs`](https://neatlogs.com) (Observability & Evals) • [`Entire`](https://entire.io) (Code-Graph Engine) • [`cfo.ai`](https://cfo.ai) (Unit Economics & ROI)

---

## 🎯 Project Overview

**Groovi AI** is a production-ready, full-stack Autonomous AI Agent Configuration & Execution Platform. It empowers users to define high-level operational goals (e.g., *"Audit our repository for security risks"*, *"Track AI developer hiring trends and alert Slack"*), autonomously plans multi-step tool workflows, verifies execution, and runs long-running automations.

### Why It Wins neatHack
1. **Agent That Works Literally (30%)**: Features an interactive goal-clarification state machine that dynamically negotiates requirements, queries database-backed tools, and synthesizes verifiable agent configurations.
2. **Mandatory Sponsor Integration (25%)**:
   - **`neatlogs`**: Observability, multi-model fallback tracing (`gemini-2.5-flash` ➔ `gemini-2.0-flash`), latency/token telemetry, and **neatlogs Evals** for schema compliance.
   - **`Entire`**: Code-graph AST engine (`entire-graph`) for deep repository and workspace context without token context window blowout.
   - **`cfo.ai`**: Startup economics, per-run token + Browserbase margin calculations, and an automated SaaS business plan.
3. **Demo & Telemetry (20% + 15%)**: Live neatlogs dashboard traces and public build logging on X.

---

## 🏛️ System Architecture (With Sponsor Tools)

```mermaid
flowchart TD
    subgraph Client ["🌐 Client (Next.js 16 + React 19)"]
        User["User / Developer"]
        PromptUI["Prompt Box & Wizard UI"]
        CFOViewer["cfo.ai Live Cost & ROI Card"]
    end

    subgraph BackendEngine ["⚡ Next.js API & Agent Engine"]
        ConfigRoute["POST /api/agent/configure"]
        MultiModelRetry["Gemini Model Fallback Engine<br/>2.5-flash ➔ 2.0-flash ➔ 1.5-flash"]
        SchemaValidator["Structured Output Parser"]
    end

    subgraph ObservabilityLayer ["📊 neatlogs Reliability & Evals Layer"]
        NeatTracer["⭐ neatlogs SDK Tracing<br/>• Traces each model attempt & latency<br/>• Logs fallback triggers & errors"]
        NeatEvals["⭐ neatlogs Evals Cohort<br/>• Configuration schema validity score<br/>• Tool-selection accuracy rate"]
    end

    subgraph ContextEngine ["🧠 Code-Graph Context (Entire)"]
        EntireGraph["⭐ Entire CLI / entire-graph<br/>• Symbol definitions & Callers<br/>• Repository AST for GitHub tool"]
    end

    subgraph Persistence ["📦 Persistence Layer"]
        NeonDB[("Neon Serverless Postgres")]
        Drizzle["Drizzle ORM"]
        Clerk["Clerk Authentication"]
    end

    subgraph ToolsEngine ["🛠️ Whole-Web Tooling Execution"]
        Browserbase["Browserbase (Cloud Headless Browser)"]
        WebSearch["SERP & Google Search"]
        Workspace["Slack / Gmail / Notion"]
        GitHubTool["GitHub Repo Scanner (via Entire)"]
    end

    subgraph Economics ["📈 Business Model (cfo.ai)"]
        CFOModel["cfo.ai Financial Plan<br/>• $0.062 per completed task<br/>• 82.3% SaaS Gross Margin<br/>• 22-Month Runway Model"]
    end

    User --> PromptUI --> ConfigRoute
    ConfigRoute --> Drizzle --> NeonDB
    ConfigRoute --> MultiModelRetry
    MultiModelRetry -.->|"Auto-instrumentation & spans"| NeatTracer
    NeatTracer --> NeatEvals

    MultiModelRetry --> SchemaValidator
    SchemaValidator --> ToolsEngine

    ToolsEngine --> Browserbase & WebSearch & Workspace
    ToolsEngine --> GitHubTool <--> EntireGraph

    ConfigRoute -.-> CFOModel
    CFOModel -.-> CFOViewer
```

---

## ⚡ How Sponsor Tools Are Integrated in Groovi AI

### 1. `neatlogs` (Observability, Telemetry & Evals)
* **Where It Sits**: `app/api/agent/configure/route.ts` and tool runner executions.
* **What It Does**:
  * Wraps agent configuration requests in `neatlogs.startSpan("Agent.configure")`.
  * Traces multi-model fallback attempts (`gemini-2.5-flash` ➔ `gemini-2.0-flash`) and records retries.
  * Captures token count, latency, and error states.
* **neatlogs Evals Setup**:
  * An automated evaluation script tests 10 diverse user prompts against Groovi AI to score:
    1. **Schema Adherence**: Did the output strictly validate against `AgentConfigRespSchema`?
    2. **Tool Selection Precision**: Did the agent select the correct tool (e.g. Browserbase vs SERP) for the task?
    3. **Clarification Accuracy**: Did it properly trigger `needs_clarification` on ambiguous prompts?

```typescript
// Integration Example in app/api/agent/configure/route.ts:
import { neatlogs } from "@/lib/neatlogs";

const trace = neatlogs.startSpan("Agent.configure", undefined, { promptLength: prompt.length });
try {
  // Tracing model attempt
  const modelSpan = neatlogs.startSpan(`Gemini.${modelName}`, trace.traceId);
  const response = await ai.models.generateContent(...);
  neatlogs.endSpan(modelSpan.spanId, { status: "SUCCESS" });
  neatlogs.endSpan(trace.spanId, { status: "READY" });
} catch (err: any) {
  neatlogs.endSpan(trace.spanId, { status: "FAILED", error: err.message });
}
```

---

### 2. `Entire` (Repository AST & Workspace Context)
* **Where It Sits**: In Groovi AI's GitHub & Codebase tool integrations (`lib/tools/github.ts`).
* **What It Does**:
  * When a user instructs Groovi AI to audit or interact with a software repository, Groovi AI queries **Entire** (`entire-graph`).
  * Provides ranked symbols, caller trees, and change-impact analysis rather than flooding Gemini's context window with thousands of raw source lines.
* **Command**:
  ```bash
  entire graph --file "src/index.ts" --line 42
  ```

---

### 3. `cfo.ai` (Unit Economics & SaaS Business Plan)
* **Where It Sits**: Exported business plan at [`economics/cfo_ai_summary.md`](./economics/cfo_ai_summary.md) and displayed in the UI.
* **Unit Economics Breakdown**:
  * **Gemini 2.5 Flash Tokens**: ~$0.004 per configuration
  * **Browserbase Cloud Session**: ~$0.050 per web interaction
  * **SERP API Query**: ~$0.008 per search
  * **Total Cost Per Task**: **~$0.062**
  * **Value Delivered**: Saves 1.5 human hours ($35/hr) = **$52.50 per task**
  * **Gross Margin**: **82.3%** on Pro Tier ($29/month for 200 tasks)
  * **Projected Runway**: 22 months on initial seed financing.

---

## 🛠️ Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) + React 19 | Full-stack server actions & client components |
| **Styling** | Tailwind CSS v4 + Radix UI + Lucide Icons | Modern, accessible glassmorphism design system |
| **Auth** | Clerk SaaS Authentication | Organization and user management |
| **Database** | Neon Serverless PostgreSQL | Serverless relational storage for agents, tools, and history |
| **ORM** | Drizzle ORM | Type-safe migrations and queries |
| **Primary LLM** | Google Gemini 2.5 Flash (`@google/genai`) | High-speed multi-step reasoning and structured JSON output |
| **Observability** | **neatlogs** (`@neatlogs/sdk`) | Distributed tracing, failure recovery, and agent Evals |
| **Code Intelligence** | **Entire** (`entire-graph`) | AST context and caller graph for code repository tasks |
| **Finance Engine** | **cfo.ai** | Unit economics, pricing strategy, and runway projection |
| **Browser Execution** | Browserbase | Cloud headless browser automation |

---

## 🚦 Getting Started

### 1. Prerequisites
* **Node.js**: v20+
* **Neon PostgreSQL Database** account
* **Clerk SaaS Auth** account
* **Google Gemini API Key** (`GOOGLE_CLOUD_GEMINI_API_KEY`)
* **neatlogs API Key** (from [neatlogs.com](https://neatlogs.com))

### 2. Environment Variables Configuration
Create a `.env` file in the root directory:

```env
# Neon Serverless Postgres Database (Drizzle ORM)
DATABASE_URL=postgresql://user:password@ep-cool-db.us-east-2.aws.neon.tech/neondb?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Google Cloud Gemini API
GOOGLE_CLOUD_GEMINI_API_KEY=AIzaSy...

# neatlogs Observability & Evals (Required for neatHack)
NEATLOGS_API_KEY=nl_...
NEATLOGS_PROJECT_ID=proj_grooviai_hackathon
NEATLOGS_ENDPOINT=https://api.neatlogs.com

# Entire CLI (Code Graph)
ENTIRE_CLI_PATH=entire
```

### 3. Install Dependencies & Push Database Schema
```bash
npm install
npx drizzle-kit push
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 neatlogs Evals Benchmark Scenarios

| Scenario ID | Test Prompt | Expected Primary Tool | Target Eval Score |
| :--- | :--- | :--- | :--- |
| **EVAL-01** | "Track competitor product prices on Amazon" | `Browserbase` | 100% |
| **EVAL-02** | "Summarize latest AI news from Google Search" | `SERP API` | 100% |
| **EVAL-03** | "Analyze function callers and AST in our repository" | `Entire / GitHub` | 100% |
| **EVAL-04** | "Send weekly performance report to marketing Slack" | `Slack Integration` | 100% |
| **EVAL-05** | Ambiguous prompt: "Help me do marketing" | `needs_clarification` | 100% |

---

## 🏆 neatHack Submission Checklist

- [x] **Agent Works Literally (30%)**: Interactive state machine with dynamic clarification and execution configuration.
- [x] **neatlogs Integration (25%)**: Multi-model fallback tracing and Evals rubric.
- [x] **Entire Integration (25%)**: AST repository graph navigation for code workflows.
- [x] **cfo.ai Integration (25%)**: Unit economics and business plan generated.
- [ ] **Demo Video (20%)**: Record <3 min walkthrough showing Agent generation ➔ neatlogs trace view ➔ cfo.ai financial breakdown.
- [ ] **Build in Public (15%)**: Share progress and screenshots on X tagging `@neatlogs`.
- [ ] **Final Submission**: Quote tweet the official neatlogs submission post before **October 12, 11:55 PM IST**.
