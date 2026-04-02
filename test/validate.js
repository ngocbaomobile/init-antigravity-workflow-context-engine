/**
 * Quick validation script — imports all templates and verifies output.
 * Run: node test/validate.js
 *
 * v2.0 — Updated for AI Context Engine.
 */
import { getAiIgnore } from '../src/templates/aiignore.js';
import { getAgentRules, getAgentRulesFilename } from '../src/templates/agentrules.js';
import { getWorkflowTemplate } from '../src/templates/workflow.js';
import { getGlobalRoutingTemplate, getModuleRoutingTemplate } from '../src/templates/routing.js';

let pass = 0;
let fail = 0;

function assert(label, condition) {
    if (condition) {
        console.log(`  ✅ ${label}`);
        pass++;
    } else {
        console.log(`  ❌ ${label}`);
        fail++;
    }
}

console.log('\n━━━ Template Validation (AI Context Engine Edition) ━━━\n');

// ── .aiignore ──
console.log('📄 .aiignore templates:');
const flutterIgnore = getAiIgnore('flutter');
assert('Flutter: contains .dart_tool/', flutterIgnore.includes('.dart_tool/'));
assert('Flutter: contains build/', flutterIgnore.includes('build/'));
assert('Flutter: contains common .DS_Store', flutterIgnore.includes('.DS_Store'));

const laravelIgnore = getAiIgnore('laravel');
assert('Laravel: contains vendor/', laravelIgnore.includes('vendor/'));

const reactIgnore = getAiIgnore('react');
assert('React: contains node_modules/', reactIgnore.includes('node_modules/'));
assert('React: contains .next/', reactIgnore.includes('.next/'));

// ── .agentrules ──
console.log('\n📄 .agentrules templates:');
const rules = getAgentRules('MYAPP', 'antigravity');
assert('Contains PREFIX "MYAPP"', rules.includes('MYAPP'));
assert('References Constitution file path', rules.includes('.antigravity/00_MYAPP_Agent_Workflow.md'));
assert('References Routing file path', rules.includes('.antigravity/00_Core_Routing.md'));
assert('Contains MCP references (Jira, Confluence, Context Engine)',
    rules.includes('Jira MCP') && rules.includes('Confluence MCP') && rules.includes('AI Context Engine'));
assert('NO NotebookLM reference', !rules.includes('NotebookLM'));
assert('Contains /pause, /resume, /handover', rules.includes('/pause') && rules.includes('/resume') && rules.includes('/handover'));
assert('Contains Knowledge Architecture section', rules.includes('Knowledge Architecture'));

assert('Filename for antigravity = .agentrules', getAgentRulesFilename('antigravity') === '.agentrules');
assert('Filename for cursor = .cursorrules', getAgentRulesFilename('cursor') === '.cursorrules');

// ── Workflow template ──
console.log('\n📄 Workflow (Constitution) template:');
const wf = getWorkflowTemplate('LC247', 'LC', ['MYSPACE'], ['https://git.company.com/main.git']);
assert('Header contains "LC247 CONTEXT MANIFEST"', wf.includes('LC247 CONTEXT MANIFEST'));
assert('Contains Jira key "LC-XXX"', wf.includes('LC-XXX'));
assert('Contains Round 0', wf.includes('Round 0'));
assert('Contains Round 1', wf.includes('Round 1'));
assert('Contains Round 2', wf.includes('Round 2'));
assert('Contains Round 3', wf.includes('Round 3'));
assert('Contains execution_status YAML block', wf.includes('execution_status:'));
assert('Contains Session Resume Protocol', wf.includes('Session Resume Protocol'));
assert('Contains /pause sub-agent', wf.includes('/pause'));
assert('Contains /resume sub-agent', wf.includes('/resume'));
assert('Contains /handover sub-agent', wf.includes('/handover'));
assert('Contains handover_notes YAML', wf.includes('handover_notes:'));
assert('Contains decision tree', wf.includes('Decision Tree'));
assert('NO leftover "BTRACK" literals', !wf.includes('BTRACK'));
assert('Constitution path references LC247', wf.includes('00_LC247_Agent_Workflow.md'));
assert('NO NotebookLM reference in workflow', !wf.includes('NotebookLM'));
assert('Contains "AI Context Engine"', wf.includes('AI Context Engine'));
assert('Contains knowledge_engine: ai-context-engine', wf.includes('knowledge_engine: ai-context-engine'));
assert('Contains Confluence space ID "MYSPACE"', wf.includes('MYSPACE'));
assert('Contains Git repo URL', wf.includes('https://git.company.com/main.git'));
assert('Knowledge writeback goes to Confluence', wf.includes('Confluence MCP') && wf.includes('auto-index'));
assert('Contains knowledge_sources section', wf.includes('knowledge_sources:'));
assert('Contains git_repos in manifest', wf.includes('git_repos:'));
assert('Contains confluence_spaces in manifest', wf.includes('confluence_spaces:'));

// ── Routing template (Global) ──
console.log('\n📄 Routing (Global) template:');
const globalRouting = getGlobalRoutingTemplate('LC247', 'LC', ['SPACE1', 'SPACE2'], ['https://git.company.com/main.git']);
assert('Contains mode: global', globalRouting.includes('mode: global'));
assert('Contains "Master Architect"', globalRouting.includes('Master Architect'));
assert('Contains Confluence spaces', globalRouting.includes('SPACE1') && globalRouting.includes('SPACE2'));
assert('Contains Git repo', globalRouting.includes('https://git.company.com/main.git'));
assert('Contains Full Access', globalRouting.includes('Full Access'));
assert('Contains [Global-Convention] prefix', globalRouting.includes('[Global-Convention]'));
assert('Contains [Module-{Name}] prefix', globalRouting.includes('[Module-{Name}]'));
assert('Contains Knowledge Writeback Rules', globalRouting.includes('Knowledge Writeback Rules'));
assert('Contains "Confluence is the source of truth"', globalRouting.includes('source of truth'));
assert('NO NotebookLM reference', !globalRouting.includes('NotebookLM'));

// ── Routing template (Module) ──
console.log('\n📄 Routing (Module) template:');
const moduleRouting = getModuleRoutingTemplate('LC247', 'Payment', 'LC', ['SPACE1'], ['https://git.company.com/payment.git'], ['Auth', 'Core']);
assert('Contains mode: module', moduleRouting.includes('mode: module'));
assert('Contains module: Payment', moduleRouting.includes('module: Payment'));
assert('Contains Module-Payment access rules', moduleRouting.includes('[Module-Payment]'));
assert('Contains READ-ONLY dependency Auth', moduleRouting.includes('Module-Auth') && moduleRouting.includes('READ-ONLY'));
assert('Contains READ-ONLY dependency Core', moduleRouting.includes('Module-Core') && moduleRouting.includes('READ-ONLY'));
assert('Contains CANNOT access other modules', moduleRouting.includes('CANNOT'));
assert('Contains "NEVER create [Global-*]"', moduleRouting.includes('NEVER'));
assert('Contains Confluence space', moduleRouting.includes('SPACE1'));
assert('Contains Git repo', moduleRouting.includes('https://git.company.com/payment.git'));
assert('NO NotebookLM reference', !moduleRouting.includes('NotebookLM'));

// ── Summary ──
console.log(`\n━━━ Results: ${pass} passed, ${fail} failed ━━━\n`);
process.exit(fail > 0 ? 1 : 0);
