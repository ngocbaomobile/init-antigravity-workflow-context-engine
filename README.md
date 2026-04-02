# 🚀 init-antigravity-workflow-context-engine

> Scaffold an AI Workflow for your project — with Jira, Confluence & **AI Context Engine** integration.
>
> Supports **Multi-Repo**: one shared knowledge base, each repo runs its own AI agent.
>
> Forked from [`init-antigravity-workflow`](https://github.com/ngocbaomobile/init-antigravity-workflow) — adapted for companies with their own AI Context Engine.

## Quick Start

```bash
npx init-antigravity-workflow-context-engine
```

The CLI will guide you through the setup. Just answer the prompts.

---

## What Changed from the Original?

| Aspect | Original (NotebookLM) | This Fork (AI Context Engine) |
|--------|----------------------|-------------------------------|
| **Knowledge Source** | NotebookLM (upload markdown files) | AI Context Engine (auto-indexes Git + Confluence) |
| **Code Indexing** | Manual | Auto-pull from Git → local DB |
| **Docs Indexing** | Upload to NotebookLM | Auto-extract Confluence pages → local DB |
| **Knowledge Writeback** | Upload to NotebookLM | Create Confluence page (auto-indexed) |
| **Context Isolation** | File prefix in NotebookLM | Confluence space IDs + Git repo scoping |

**What stays the same:** 4-Round Wizard, Context Manifest, Jira MCP, `/pause` `/resume` `/handover`, Global/Module modes.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│              AI Context Engine Architecture          │
│                                                      │
│  Git Repos ──auto pull──→ Context Engine (local DB) │
│  Confluence ──extract──→  Context Engine (local DB) │
│  Jira ──────MCP────────→ Agent                      │
│                                                      │
│  Agent ──query──→ Context Engine ──→ brainstorm/plan│
│  Agent ──code───→ Real source repo (not DB)         │
│  Agent ──write──→ Confluence (via MCP) → auto-sync  │
└─────────────────────────────────────────────────────┘
```

---

## Who Are You?

This tool supports **two roles**. Pick the one that matches your situation:

---

### 🏗️ I'm setting up the **Main Project**

> **You are the Lead / Architect.** You define system-wide rules that all teams must follow.

**When to pick this:** You're the one creating the **central repository** or the **master standards** for the project.

```bash
cd ~/projects/my-main-project
npx init-antigravity-workflow-context-engine
# Select: Global (Master Architect)
```

**What you get:**

```
my-main-project/
├── .aiignore
├── .agentrules
└── .antigravity/
    ├── 00_MYAPP_Agent_Workflow.md    # "Constitution" — 4-Round Wizard
    └── 00_Core_Routing.md            # Full access to all knowledge sources
```

**Your responsibilities:**
- Create `[Global-Convention]` pages in Confluence (architecture rules, coding standards, git flow)
- The AI Context Engine auto-indexes them into the shared knowledge space
- All module teams inherit your rules automatically

> **💡 Important Note:**
> After generating the Architecture Map, create supplementary convention pages in Confluence
> (e.g., `[Global-Convention] Clean_Architecture_Rules`, `[Global-Convention] UI_Theme_Standards`).
> This establishes the "Global Knowledge Pool" that all module agents rely on.

---

### 📦 I'm setting up a **Sub-Module**

> **You are a Module Owner / Team Lead.** You own one specific part of the system (e.g. Payment, Auth, Booking).

```bash
cd ~/projects/payment-service
npx init-antigravity-workflow-context-engine
# Select: Module (Module Owner)
# Enter module name: Payment
```

**What you get:**

```
payment-service/
├── .aiignore
├── .agentrules
└── .antigravity/
    ├── 00_MYAPP_Agent_Workflow.md    # "Constitution" — scoped 4-Round Wizard
    └── 00_Core_Routing.md            # ⚠️ Restricted: Global + your module ONLY
```

**Context Isolation — your AI agent can only access:**
- ✅ `[Global-Convention]` pages — system-wide rules
- ✅ `[Module-Payment]` pages — your own module's docs
- ✅ `[Module-Auth]`, `[Module-Core]` — declared dependencies (READ-ONLY)
- ❌ Other modules' pages — blocked

**How dependencies work:**
- **Flutter projects**: auto-detected from `pubspec.yaml` path dependencies
- **Other frameworks**: enter manually during setup
- Dependencies are **READ-ONLY** — your agent can read their docs but cannot modify them

---

## CLI Prompts

When you run the CLI, you'll be asked:

```
1.  Select your role: Global / Module
2.  [Module only] Enter module name
3.  Select framework (Flutter, Laravel, React, Node.js, Python, Other)
4.  Enter project PREFIX (e.g. LC247, BTRACK)
5.  Enter Jira project key
6.  Enter Confluence Space ID(s)          ← for Context Engine indexing
7.  Enter Git repo URL(s)                 ← for Context Engine indexing
8.  [Module only] Module dependencies     ← auto-detect or manual
9.  Select AI agent (Antigravity/Cursor/Both)
10. Overwrite existing files?
```

---

## How Multi-Repo Knowledge Works

Everyone uses **one shared Confluence workspace**. Pages are organized by prefix:

```
Confluence (shared workspace)
│
├── [Global-Convention] Master_Architecture.md       ← Main Project writes
├── [Global-Convention] Clean_Architecture_Rules.md   ← Everyone must follow
├── [Global-ADR] ADR-001_State_Management.md          ← System-wide decisions
│
├── [Module-Payment] Convention_API_Design.md         ← Payment team writes
├── [Module-Payment] ADR-001_Gateway_Choice.md        ← Only Payment agent reads
│
├── [Module-Auth] Convention_JWT_Flow.md               ← Auth team writes
└── [Module-Booking] ...                               ← Booking team writes
```

The AI Context Engine auto-indexes all pages. Each module agent only queries pages matching its routing rules.

---

## What the AI Agent Does (4-Round Wizard)

| Round | What Happens |
|-------|-------------|
| **0** | No Jira ticket? Agent interviews you and creates one automatically. |
| **1** | Agent gathers context from Jira, Confluence, AI Context Engine → builds a Context Manifest. |
| **2** | Agent generates an Execution Plan from the manifest → you approve it. |
| **3** | Agent writes code (to real repo), runs linters, updates Jira, optionally publishes knowledge to Confluence. |

The agent also supports slash commands: `/pause`, `/resume`, `/handover`.

---

## Generated Files Explained

| File | What it does |
|------|-------------|
| `.aiignore` | Like `.gitignore` but for AI agents — hides build artifacts, `node_modules`, etc. |
| `.agentrules` | Forces the AI to read the Constitution + Routing before doing anything. |
| `00_[PREFIX]_Agent_Workflow.md` | The "Constitution" — 4-Round Wizard, Context Manifest, status tracking, sub-agents. |
| `00_Core_Routing.md` | Controls which Confluence spaces, Git repos, and module docs the AI can access. |

---

## Requirements

- Node.js ≥ 18
- An AI agent with MCP support (Jira, Confluence)
- AI Context Engine configured to index your Git repos and Confluence spaces

---

## Version History

| Version | Changes |
|---------|--------|
| 2.0.0 | Fork: Replace NotebookLM with AI Context Engine. Add Confluence Space ID / Git repo prompts. Knowledge writeback via Confluence MCP. |

**Based on** [init-antigravity-workflow](https://github.com/ngocbaomobile/init-antigravity-workflow) v1.3.3.

## License

MIT
