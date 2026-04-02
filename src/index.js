/**
 * init-antigravity-workflow-context-engine — Main CLI Logic
 *
 * Interactive wizard that scaffolds the 4-Round AI Workflow for any project.
 * Generates: .aiignore, .agentrules/.cursorrules, .antigravity/ directory,
 * the Constitution file (00_[PREFIX]_Agent_Workflow.md),
 * and the Core Routing file (00_Core_Routing.md).
 *
 * v2.0 — Adapted for AI Context Engine (replaces NotebookLM).
 */

import { select, input, confirm, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

import { getAiIgnore } from './templates/aiignore.js';
import { getAgentRules, getAgentRulesFilename } from './templates/agentrules.js';
import { getWorkflowTemplate } from './templates/workflow.js';
import { getGlobalRoutingTemplate, getModuleRoutingTemplate } from './templates/routing.js';

// ─── Constants ───────────────────────────────────────────────────────────────
const ANTIGRAVITY_DIR = '.antigravity';
const VERSION = '2.0.0';

const FRAMEWORKS = [
    { name: 'Flutter (Dart)', value: 'flutter' },
    { name: 'Laravel (PHP)', value: 'laravel' },
    { name: 'React / Next.js', value: 'react' },
    { name: 'Node.js / Express', value: 'nodejs' },
    { name: 'Python / Django', value: 'python' },
    { name: 'Other', value: 'other' },
];

const AGENT_TARGETS = [
    { name: 'Antigravity (Gemini)', value: 'antigravity' },
    { name: 'Cursor', value: 'cursor' },
    { name: 'Both', value: 'both' },
];

const MODES = [
    { name: 'Global (Master Architect) — Define system-wide rules for all teams', value: 'global' },
    { name: 'Module (Module Owner) — Own one specific part of the system', value: 'module' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Safe write: creates parent dirs if needed, skips if file exists and not forced */
function safeWrite(filePath, content, overwrite = false) {
    if (existsSync(filePath) && !overwrite) {
        console.log(chalk.yellow(`  ⚠  Skipped (exists): ${filePath}`));
        return false;
    }
    const dir = resolve(filePath, '..');
    mkdirSync(dir, { recursive: true });
    writeFileSync(filePath, content, 'utf-8');
    console.log(chalk.green(`  ✓  Created: ${filePath}`));
    return true;
}

/** Print a styled section header */
function header(text) {
    console.log('');
    console.log(chalk.cyan.bold(`━━━ ${text} ━━━`));
}

/** Parse comma-separated input into trimmed array */
function parseCommaSeparated(val) {
    if (!val || val.trim().length === 0) return [];
    return val.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Auto-detect module dependencies from pubspec.yaml (Flutter projects).
 * Looks for path dependencies that are siblings or subdirectories.
 */
function detectFlutterDependencies(cwd) {
    const pubspecPath = join(cwd, 'pubspec.yaml');
    if (!existsSync(pubspecPath)) return [];

    try {
        const content = readFileSync(pubspecPath, 'utf-8');
        const deps = [];
        // Simple regex to find path dependencies
        const pathDepRegex = /^\s+(\w[\w_-]*):\s*\n\s+path:\s+(.+)$/gm;
        let match;
        while ((match = pathDepRegex.exec(content)) !== null) {
            deps.push(match[1]);
        }
        return deps;
    } catch {
        return [];
    }
}

// ─── Main ────────────────────────────────────────────────────────────────────

export async function run() {
    const cwd = process.cwd();

    // ── Banner ──
    console.log('');
    console.log(chalk.bgCyan.black.bold('                                                        '));
    console.log(chalk.bgCyan.black.bold(`   🚀  init-antigravity-workflow  v${VERSION}              `));
    console.log(chalk.bgCyan.black.bold('   AI Context Engine Edition                             '));
    console.log(chalk.bgCyan.black.bold('   Universal AI Workflow Bootstrapper                    '));
    console.log(chalk.bgCyan.black.bold('                                                        '));
    console.log('');
    console.log(chalk.dim(`  Working directory: ${cwd}`));
    console.log('');

    // ── Step 1: Interactive Prompts ──
    header('Step 1 — Project Configuration');

    // 1a. Mode selection: Global or Module
    const mode = await select({
        message: 'Select your role:',
        choices: MODES,
    });

    let moduleName = '';
    let dependencyModules = [];

    if (mode === 'module') {
        moduleName = await input({
            message: 'Enter your module name (e.g. Payment, Auth, Booking):',
            validate: (val) => {
                if (!val || val.trim().length === 0) return 'Module name is required.';
                if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(val.trim())) return 'Module name must start with a letter and be alphanumeric.';
                return true;
            },
        });
        moduleName = moduleName.trim();
    }

    // 1b. Framework
    const framework = await select({
        message: 'Select your project framework:',
        choices: FRAMEWORKS,
    });

    // 1c. Prefix
    const rawPrefix = await input({
        message: 'Enter your project PREFIX (e.g. LC247, MYAPP):',
        validate: (val) => {
            if (!val || val.trim().length === 0) return 'PREFIX is required.';
            if (!/^[A-Za-z0-9_-]+$/.test(val.trim())) return 'PREFIX must be alphanumeric (letters, numbers, hyphens, underscores).';
            return true;
        },
    });
    const prefix = rawPrefix.trim().toUpperCase();

    // 1d. Jira key
    const jiraKey = await input({
        message: `Enter Jira project key (default: ${prefix}):`,
        default: prefix,
        transformer: (val) => val.toUpperCase(),
    });

    // 1e. Confluence Space IDs
    const rawSpaces = await input({
        message: 'Enter Confluence Space ID(s) (comma-separated, or leave empty to set later):',
        default: '',
    });
    const confluenceSpaceIds = parseCommaSeparated(rawSpaces);

    // 1f. Git repo URLs
    const rawRepos = await input({
        message: 'Enter Git repo URL(s) indexed by Context Engine (comma-separated, or leave empty to set later):',
        default: '',
    });
    const gitRepos = parseCommaSeparated(rawRepos);

    // 1g. Module dependencies (Module mode only)
    if (mode === 'module') {
        // Auto-detect for Flutter
        if (framework === 'flutter') {
            const detected = detectFlutterDependencies(cwd);
            if (detected.length > 0) {
                console.log(chalk.dim(`  Auto-detected path dependencies: ${detected.join(', ')}`));
                const useDetected = await confirm({
                    message: `Use detected dependencies as READ-ONLY modules? (${detected.join(', ')})`,
                    default: true,
                });
                if (useDetected) {
                    dependencyModules = detected;
                }
            }
        }

        if (dependencyModules.length === 0) {
            const rawDeps = await input({
                message: 'Enter dependency module names (comma-separated, e.g. Auth,Core — READ-ONLY access). Leave empty if none:',
                default: '',
            });
            dependencyModules = parseCommaSeparated(rawDeps);
        }
    }

    // 1h. Agent target
    const agentTarget = await select({
        message: 'Select your AI agent:',
        choices: AGENT_TARGETS,
    });

    // 1i. Overwrite
    const overwrite = await confirm({
        message: 'Overwrite existing files if they exist?',
        default: false,
    });

    // ── Summary ──
    console.log('');
    console.log(chalk.dim('─'.repeat(60)));
    console.log(chalk.white.bold('  Configuration Summary:'));
    console.log(`    Mode            : ${chalk.cyan(mode === 'global' ? 'Global (Master Architect)' : `Module (${moduleName})`)}`);
    console.log(`    Framework       : ${chalk.cyan(framework)}`);
    console.log(`    PREFIX          : ${chalk.cyan(prefix)}`);
    console.log(`    Jira Key        : ${chalk.cyan(jiraKey.toUpperCase())}`);
    console.log(`    Confluence Spaces: ${chalk.cyan(confluenceSpaceIds.length > 0 ? confluenceSpaceIds.join(', ') : '(set later)')}`);
    console.log(`    Git Repos       : ${chalk.cyan(gitRepos.length > 0 ? gitRepos.join(', ') : '(set later)')}`);
    if (mode === 'module') {
        console.log(`    Dependencies    : ${chalk.cyan(dependencyModules.length > 0 ? dependencyModules.join(', ') : '(none)')}`);
    }
    console.log(`    Agent Target    : ${chalk.cyan(agentTarget)}`);
    console.log(`    Overwrite       : ${chalk.cyan(overwrite ? 'Yes' : 'No')}`);
    console.log(chalk.dim('─'.repeat(60)));

    const proceed = await confirm({
        message: 'Proceed with scaffolding?',
        default: true,
    });

    if (!proceed) {
        console.log(chalk.yellow('\n  Aborted. No files were created.\n'));
        return;
    }

    // ── Step 2: Scaffolding ──
    header('Step 2 — Generating Files');

    // 2a. .aiignore
    const aiignorePath = join(cwd, '.aiignore');
    safeWrite(aiignorePath, getAiIgnore(framework), overwrite);

    // 2b. .agentrules / .cursorrules
    const rulesFilename = getAgentRulesFilename(agentTarget);
    const rulesPath = join(cwd, rulesFilename);
    safeWrite(rulesPath, getAgentRules(prefix, agentTarget), overwrite);

    // 2c. If target is "both", also generate .cursorrules
    if (agentTarget === 'both') {
        const cursorPath = join(cwd, '.cursorrules');
        safeWrite(cursorPath, getAgentRules(prefix, 'cursor'), overwrite);
    }

    // 2d. .antigravity/ directory
    const antigravDir = join(cwd, ANTIGRAVITY_DIR);
    if (!existsSync(antigravDir)) {
        mkdirSync(antigravDir, { recursive: true });
        console.log(chalk.green(`  ✓  Created: ${ANTIGRAVITY_DIR}/`));
    } else {
        console.log(chalk.yellow(`  ⚠  Exists:  ${ANTIGRAVITY_DIR}/`));
    }

    // 2e. Constitution file: 00_[PREFIX]_Agent_Workflow.md
    const workflowFilename = `00_${prefix}_Agent_Workflow.md`;
    const workflowPath = join(antigravDir, workflowFilename);
    safeWrite(workflowPath, getWorkflowTemplate(prefix, jiraKey.toUpperCase(), confluenceSpaceIds, gitRepos), overwrite);

    // 2f. Core Routing file: 00_Core_Routing.md
    const routingFilename = '00_Core_Routing.md';
    const routingPath = join(antigravDir, routingFilename);
    if (mode === 'global') {
        safeWrite(routingPath, getGlobalRoutingTemplate(prefix, jiraKey.toUpperCase(), confluenceSpaceIds, gitRepos), overwrite);
    } else {
        safeWrite(routingPath, getModuleRoutingTemplate(prefix, moduleName, jiraKey.toUpperCase(), confluenceSpaceIds, gitRepos, dependencyModules), overwrite);
    }

    // ── Step 3: Success Banner ──
    header('Step 3 — Done! 🎉');

    console.log('');
    console.log(chalk.green.bold('  ✅ Antigravity Workflow initialized successfully!'));
    console.log(chalk.dim(`     Mode: ${mode === 'global' ? 'Global (Master Architect)' : `Module (${moduleName})`}`));
    console.log(chalk.dim(`     Knowledge Engine: AI Context Engine`));
    console.log('');
    console.log(chalk.white('  Generated files:'));
    console.log(chalk.dim(`    • .aiignore                          (${framework} patterns)`));
    console.log(chalk.dim(`    • ${rulesFilename}${' '.repeat(Math.max(0, 33 - rulesFilename.length))}(agent pre-flight rules)`));
    if (agentTarget === 'both') {
        console.log(chalk.dim('    • .cursorrules                       (agent pre-flight rules)'));
    }
    console.log(chalk.dim(`    • ${ANTIGRAVITY_DIR}/${workflowFilename}`));
    console.log(chalk.dim(`    • ${ANTIGRAVITY_DIR}/${routingFilename}`));
    console.log('');

    // ── Architecture Mapping Prompt ──
    console.log(chalk.dim('═'.repeat(60)));
    console.log(chalk.yellow.bold('  📋 NEXT STEP — Architecture Mapping'));
    console.log(chalk.dim('═'.repeat(60)));
    console.log('');
    console.log(chalk.white('  Copy the prompt below and paste it into your AI agent'));
    console.log(chalk.white('  chat to auto-generate an Architecture Map:'));
    console.log('');

    if (mode === 'global') {
        console.log(chalk.dim('  ┌─────────────────────────────────────────────────────'));
        console.log(chalk.cyan(`  │  Scan the entire codebase of this project.`));
        console.log(chalk.cyan(`  │  Identify: folder structure, entry points, key modules,`));
        console.log(chalk.cyan(`  │  state management patterns, API layers, and routing.`));
        console.log(chalk.cyan(`  │  Output a comprehensive Architecture Map as Markdown`));
        console.log(chalk.cyan(`  │  and save it to:`));
        console.log(chalk.cyan.bold(`  │  .antigravity/${prefix}_Architecture_Map.md`));
        console.log(chalk.cyan(`  │`));
        console.log(chalk.cyan(`  │  Then create a Confluence page titled:`));
        console.log(chalk.cyan.bold(`  │  [Global-Convention] Master_Architecture`));
        console.log(chalk.dim('  └─────────────────────────────────────────────────────'));
    } else {
        console.log(chalk.dim('  ┌─────────────────────────────────────────────────────'));
        console.log(chalk.cyan(`  │  Scan the entire codebase of this project.`));
        console.log(chalk.cyan(`  │  Focus on the ${moduleName} module.`));
        console.log(chalk.cyan(`  │  Identify: folder structure, entry points, key classes,`));
        console.log(chalk.cyan(`  │  state management patterns, API layers, and routing.`));
        console.log(chalk.cyan(`  │  Output a Module Architecture Map as Markdown`));
        console.log(chalk.cyan(`  │  and save it to:`));
        console.log(chalk.cyan.bold(`  │  .antigravity/${prefix}_${moduleName}_Architecture_Map.md`));
        console.log(chalk.cyan(`  │`));
        console.log(chalk.cyan(`  │  Then create a Confluence page titled:`));
        console.log(chalk.cyan.bold(`  │  [Module-${moduleName}] Architecture_Map`));
        console.log(chalk.dim('  └─────────────────────────────────────────────────────'));
    }

    console.log('');
    console.log(chalk.dim('  The agent will analyze your codebase and generate a'));
    console.log(chalk.dim(`  detailed map, then publish it to Confluence for the`));
    console.log(chalk.dim(`  AI Context Engine to index automatically.`));
    console.log('');

    // ── Reminder for Global mode ──
    if (mode === 'global') {
        console.log(chalk.dim('═'.repeat(60)));
        console.log(chalk.yellow.bold('  💡 REMINDER FOR MASTER ARCHITECTS'));
        console.log(chalk.dim('═'.repeat(60)));
        console.log('');
        console.log(chalk.white('  After generating the Architecture Map, also create'));
        console.log(chalk.white('  supplementary convention files in Confluence:'));
        console.log(chalk.dim('    • [Global-Convention] Clean_Architecture_Rules'));
        console.log(chalk.dim('    • [Global-Convention] UI_Theme_Standards'));
        console.log(chalk.dim('    • [Global-Convention] Git_Flow_Rules'));
        console.log('');
        console.log(chalk.white('  These establish the "Global Knowledge Pool" that all'));
        console.log(chalk.white('  module agents will automatically inherit.'));
        console.log('');
    }
}
