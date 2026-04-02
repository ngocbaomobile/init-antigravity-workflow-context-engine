/**
 * 00_Core_Routing.md — Context Routing template.
 * Controls which knowledge sources each AI agent can access.
 * Supports Global (full access) and Module (scoped access) modes.
 *
 * v2.0 — AI Context Engine version.
 */

/**
 * Generate the Core Routing file for Global (Master Architect) mode.
 * @param {string} prefix - Project prefix
 * @param {string} jiraKey - Jira project key
 * @param {string[]} confluenceSpaceIds - Confluence space IDs
 * @param {string[]} gitRepos - Git repo URLs
 * @returns {string} Markdown content
 */
export function getGlobalRoutingTemplate(prefix, jiraKey, confluenceSpaceIds = [], gitRepos = []) {
    const key = jiraKey || prefix;
    const spacesSection = confluenceSpaceIds.length > 0
        ? confluenceSpaceIds.map((s, i) => `| ${i + 1} | \`${s}\` | ✅ Full Access | — |`).join('\n')
        : '| 1 | `[SPACE_ID]` | ✅ Full Access | — |';
    const reposSection = gitRepos.length > 0
        ? gitRepos.map((r, i) => `| ${i + 1} | \`${r}\` | ✅ Full Access |`).join('\n')
        : '| 1 | `[REPO_URL]` | ✅ Full Access |';

    return `---
name: core-routing
description: Context routing rules for ${prefix} — Global (Master Architect) mode.
mode: global
prefix: ${prefix}
---

# ${prefix} Context Routing Rules

> **Mode: Global (Master Architect)**
> This agent has FULL ACCESS to all knowledge sources.

---

## 1. Confluence Knowledge Spaces

The AI Context Engine indexes the following Confluence spaces:

| # | Space ID | Access Level | Notes |
|---|----------|-------------|-------|
${spacesSection}

### Confluence Categorization

Files in Confluence should follow the prefix naming convention:

| Prefix | Purpose | Who Writes |
|--------|---------|------------|
| \`[Global-Convention]\` | System-wide coding standards, architecture rules | Master Architect |
| \`[Global-ADR]\` | System-wide Architecture Decision Records | Master Architect |
| \`[Module-{Name}]\` | Module-specific conventions and docs | Module Owner |
| \`[Module-{Name}-ADR]\` | Module-specific decision records | Module Owner |
| \`[Module-{Name}-Troubleshooting]\` | Module-specific bug logs, post-mortems | Module Owner |

---

## 2. Git Repositories

The AI Context Engine indexes code from these repositories:

| # | Repository | Access Level |
|---|-----------|-------------|
${reposSection}

---

## 3. Jira Integration

| Setting | Value |
|---------|-------|
| Project Key | \`${key}\` |
| Access | ✅ Full (Create, Read, Update tickets) |

---

## 4. Access Control Summary

As a **Global (Master Architect)** agent, you have:
- ✅ Read/Write access to ALL \`[Global-Convention]\` and \`[Global-ADR]\` documents
- ✅ Read access to ALL \`[Module-*]\` documents
- ✅ Full access to all indexed Git repositories
- ✅ Full access to Jira tickets in project \`${key}\`

---

## 5. Knowledge Writeback Rules

When generating new knowledge (ADRs, post-mortems, conventions):

1. **Create a Confluence page** via Confluence MCP in the appropriate space.
2. **Use the correct prefix** in the page title (e.g., \`[Global-Convention] Clean Architecture Rules\`).
3. The AI Context Engine will **automatically re-index** the new page.
4. **Do NOT** write knowledge to local files — Confluence is the source of truth.
`;
}

/**
 * Generate the Core Routing file for Module (Module Owner) mode.
 * @param {string} prefix - Project prefix
 * @param {string} moduleName - Module name (e.g. "Payment", "Auth")
 * @param {string} jiraKey - Jira project key
 * @param {string[]} confluenceSpaceIds - Confluence space IDs
 * @param {string[]} gitRepos - Git repo URLs
 * @param {string[]} dependencyModules - READ-ONLY dependency module names
 * @returns {string} Markdown content
 */
export function getModuleRoutingTemplate(prefix, moduleName, jiraKey, confluenceSpaceIds = [], gitRepos = [], dependencyModules = []) {
    const key = jiraKey || prefix;
    const spacesSection = confluenceSpaceIds.length > 0
        ? confluenceSpaceIds.map((s, i) => `| ${i + 1} | \`${s}\` | Scoped (see below) | — |`).join('\n')
        : '| 1 | `[SPACE_ID]` | Scoped (see below) | — |';
    const reposSection = gitRepos.length > 0
        ? gitRepos.map((r, i) => `| ${i + 1} | \`${r}\` | ✅ Full Access |`).join('\n')
        : '| 1 | `[REPO_URL]` | ✅ Full Access |';
    const depsSection = dependencyModules.length > 0
        ? dependencyModules.map(d => `| \`[Module-${d}]\` | 🔒 READ-ONLY | Understand interfaces only |`).join('\n')
        : '| _(none declared)_ | — | — |';

    return `---
name: core-routing
description: Context routing rules for ${prefix} — Module (${moduleName}) mode.
mode: module
prefix: ${prefix}
module: ${moduleName}
---

# ${prefix} Context Routing Rules — Module: ${moduleName}

> **Mode: Module (${moduleName})**
> This agent has SCOPED access — Global rules + your module's knowledge ONLY.

---

## 1. Confluence Knowledge Spaces

The AI Context Engine indexes the following Confluence spaces:

| # | Space ID | Access Level | Notes |
|---|----------|-------------|-------|
${spacesSection}

### What You CAN Access

| Prefix | Access | Purpose |
|--------|--------|---------|
| \`[Global-Convention]\` | ✅ READ | System-wide coding standards |
| \`[Global-ADR]\` | ✅ READ | System-wide decisions |
| \`[Module-${moduleName}]\` | ✅ READ/WRITE | Your module's conventions and docs |
| \`[Module-${moduleName}-ADR]\` | ✅ READ/WRITE | Your module's decision records |
| \`[Module-${moduleName}-Troubleshooting]\` | ✅ READ/WRITE | Your module's bug logs |

### Dependencies (READ-ONLY)

| Prefix | Access | Purpose |
|--------|--------|---------|
${depsSection}

### What You CANNOT Access

- ❌ Other modules' \`[Module-*]\` files (unless declared as dependency above)
- ❌ Creating or modifying \`[Global-Convention]\` or \`[Global-ADR]\` documents

---

## 2. Git Repositories

The AI Context Engine indexes code from these repositories:

| # | Repository | Access Level |
|---|-----------|-------------|
${reposSection}

---

## 3. Jira Integration

| Setting | Value |
|---------|-------|
| Project Key | \`${key}\` |
| Access | ✅ Full (Create, Read, Update tickets) |

---

## 4. Access Control Summary

As a **Module (${moduleName})** agent, you have:
- ✅ Read access to \`[Global-Convention]\` and \`[Global-ADR]\` documents
- ✅ Read/Write access to \`[Module-${moduleName}]\` documents
${dependencyModules.length > 0 ? dependencyModules.map(d => `- 🔒 Read-only access to \`[Module-${d}]\` documents`).join('\n') : '- _(no dependency modules declared)_'}
- ❌ No access to other modules' documents
- ✅ Full access to your module's Git repository
- ✅ Full access to Jira tickets in project \`${key}\`

---

## 5. Knowledge Writeback Rules

When generating new knowledge (ADRs, post-mortems, conventions):

1. **Create a Confluence page** via Confluence MCP in the appropriate space.
2. **Use YOUR module prefix** in the page title (e.g., \`[Module-${moduleName}] Convention_API_Design\`).
3. **NEVER** create \`[Global-*]\` documents — only the Master Architect can do that.
4. The AI Context Engine will **automatically re-index** the new page.
5. **Do NOT** write knowledge to local files — Confluence is the source of truth.
`;
}
