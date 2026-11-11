<template>
    <section id="sandbox-section" class="sandbox-wrapper">
        <div class="section-header-row">
            <div>
                <span class="section-eyebrow">
                    <i class="pi pi-sliders-h"></i> Hands-On Interactive Lab
                </span>
                <h2 class="section-heading">Learn by Doing: Live Floowsynk Sandboxes</h2>
                <p class="section-subheading">
                    Experiment with template variables, execute Goja JavaScript code, test Pin Data caching, and simulate Model Context Protocol (MCP) agent calls right in your browser.
                </p>
            </div>

            <!-- Sandbox Mode Tabs -->
            <div class="sandbox-tabs" role="tablist">
                <button
                    type="button"
                    class="sandbox-tab-btn"
                    :class="{ active: activeTab === 'variables' }"
                    @click="emit('update:activeTab', 'variables')"
                >
                    <i class="pi pi-tag"></i>
                    <span>1. Variable Pills</span>
                </button>
                <button
                    type="button"
                    class="sandbox-tab-btn"
                    :class="{ active: activeTab === 'goja' }"
                    @click="emit('update:activeTab', 'goja')"
                >
                    <i class="pi pi-code"></i>
                    <span>2. Goja JS Runner</span>
                </button>
                <button
                    type="button"
                    class="sandbox-tab-btn"
                    :class="{ active: activeTab === 'pindata' }"
                    @click="emit('update:activeTab', 'pindata')"
                >
                    <i class="pi pi-bookmark"></i>
                    <span>3. Pin Data Simulator</span>
                </button>
                <button
                    type="button"
                    class="sandbox-tab-btn"
                    :class="{ active: activeTab === 'mcp' }"
                    @click="emit('update:activeTab', 'mcp')"
                >
                    <i class="pi pi-cpu"></i>
                    <span>4. MCP AI Agent Connect</span>
                </button>
            </div>
        </div>

        <!-- TAB 1: VARIABLE EXPRESSION & TEMPLATE EVALUATOR -->
        <div v-if="activeTab === 'variables'" class="sandbox-panel">
            <div class="sandbox-grid-2">
                <div class="sandbox-col">
                    <div class="panel-label-bar">
                        <span><i class="pi pi-database"></i> Mock Upstream Node Payload (<code>$input</code> &amp; <code>$vars</code>)</span>
                        <span class="pill-hint">Click any variable pill to insert</span>
                    </div>

                    <div class="variable-pills-cloud">
                        <button
                            v-for="pill in availableVariablePills"
                            :key="pill.token"
                            type="button"
                            class="var-pill-chip"
                            @click="insertVariableToken(pill.token)"
                            :title="`Insert ${pill.token}`"
                        >
                            <i class="pi pi-plus-circle"></i>
                            <code>{{ pill.token }}</code>
                            <span class="pill-preview">= {{ pill.sample }}</span>
                        </button>
                    </div>

                    <label class="field-caption">Editable <code>$input</code> JSON Payload:</label>
                    <textarea
                        v-model="varInputJson"
                        class="code-textarea"
                        rows="7"
                        spellcheck="false"
                    ></textarea>
                </div>

                <div class="sandbox-col">
                    <div class="panel-label-bar">
                        <span><i class="pi pi-pencil"></i> Template Expression Editor</span>
                        <button type="button" class="mini-reset-btn" @click="resetVariableTemplate">Reset Example</button>
                    </div>

                    <textarea
                        v-model="templateExpression"
                        class="code-textarea template-input"
                        rows="5"
                        placeholder="Type text with {{ $input.user.name }} expressions..."
                    ></textarea>

                    <div class="output-preview-box">
                        <div class="output-header">
                            <span><i class="pi pi-bolt"></i> Real-Time Resolved Output</span>
                            <span class="eval-badge">Zero-Alloc Fast Path</span>
                        </div>
                        <div class="resolved-output-text">{{ evaluatedTemplateResult }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- TAB 2: IN-BROWSER GOJA JAVASCRIPT RUNNER -->
        <div v-else-if="activeTab === 'goja'" class="sandbox-panel">
            <div class="preset-selector-bar">
                <span class="preset-label">Load Preset Script:</span>
                <button
                    v-for="preset in scriptPresets"
                    :key="preset.id"
                    type="button"
                    class="preset-chip"
                    :class="{ active: activePresetId === preset.id }"
                    @click="selectScriptPreset(preset.id)"
                >
                    {{ preset.name }}
                </button>
            </div>

            <div class="sandbox-grid-2">
                <div class="sandbox-col">
                    <div class="panel-label-bar">
                        <span><i class="pi pi-code"></i> Goja JavaScript Code (Access <code>$input</code> &amp; <code>$vars</code>)</span>
                        <button type="button" class="run-script-btn" @click="executeGojaSandbox">
                            <i class="pi pi-play"></i>
                            <span>Execute Script</span>
                        </button>
                    </div>
                    <textarea
                        v-model="gojaCode"
                        class="code-textarea js-editor"
                        rows="12"
                        spellcheck="false"
                    ></textarea>
                </div>

                <div class="sandbox-col">
                    <div class="panel-label-bar">
                        <span><i class="pi pi-sliders-h"></i> Incoming <code>$input</code> JSON</span>
                        <span v-if="gojaExecDurationMs !== null" class="exec-time-badge">
                            <i class="pi pi-clock"></i> Executed in {{ gojaExecDurationMs }}ms (Limit: 5000ms)
                        </span>
                    </div>
                    <textarea
                        v-model="gojaInputJson"
                        class="code-textarea"
                        rows="5"
                        spellcheck="false"
                    ></textarea>

                    <div class="output-preview-box dark-terminal">
                        <div class="output-header">
                            <span><i class="pi pi-terminal"></i> Execution Result &amp; Console Logs</span>
                            <span
                                class="status-tag"
                                :class="gojaError ? 'error' : 'success'"
                            >
                                {{ gojaError ? 'Runtime Error' : '200 OK' }}
                            </span>
                        </div>
                        <div v-if="gojaConsoleLogs.length" class="console-log-list">
                            <div v-for="(log, idx) in gojaConsoleLogs" :key="idx" class="console-line">
                                <span class="log-prefix">[console.log]</span> {{ log }}
                            </div>
                        </div>
                        <pre v-if="gojaError" class="terminal-error">{{ gojaError }}</pre>
                        <pre v-else class="terminal-json">{{ gojaOutputJson }}</pre>
                    </div>
                </div>
            </div>
        </div>

        <!-- TAB 3: PIN DATA SIMULATOR -->
        <div v-else-if="activeTab === 'pindata'" class="sandbox-panel">
            <div class="pindata-explainer-bar">
                <div class="pindata-status-group">
                    <button
                        type="button"
                        class="pin-toggle-btn"
                        :class="{ pinned: isNodePinned }"
                        @click="isNodePinned = !isNodePinned"
                    >
                        <i class="pi pi-bookmark-fill"></i>
                        <span>{{ isNodePinned ? 'Node Output Pinned (Frozen)' : 'Live API Mode (Unpinned)' }}</span>
                    </button>
                    <button type="button" class="run-script-btn" :disabled="isSimulatingRun" @click="simulatePinDataRun">
                        <i class="pi" :class="isSimulatingRun ? 'pi-spin pi-spinner' : 'pi-play'"></i>
                        <span>{{ isSimulatingRun ? 'Executing Pipeline...' : 'Run Downstream Test' }}</span>
                    </button>
                </div>

                <div class="pindata-metrics">
                    <div class="metric-pill">
                        <span class="m-label">Last Run Latency:</span>
                        <strong class="m-val" :class="{ fast: isNodePinned }">{{ lastPinRunMs }} ms</strong>
                    </div>
                    <div class="metric-pill">
                        <span class="m-label">External API Calls:</span>
                        <strong class="m-val">{{ liveApiCallsCount }}</strong>
                    </div>
                    <div class="metric-pill saved">
                        <span class="m-label">API Credits Saved by Pinning:</span>
                        <strong class="m-val">${{ apiCreditsSaved.toFixed(2) }}</strong>
                    </div>
                </div>
            </div>

            <!-- Visual Pipeline Diagram -->
            <div class="pin-pipeline-stage">
                <div class="pin-node-box">
                    <div class="pin-node-header">1. Webhook Trigger</div>
                    <div class="pin-node-body">Ingests customer support ticket</div>
                    <span class="pin-node-tag">0.4ms</span>
                </div>

                <div class="pin-arrow"><i class="pi pi-arrow-right"></i></div>

                <div class="pin-node-box target-node" :class="{ pinned: isNodePinned }">
                    <div class="pin-node-header">
                        <span>2. OpenAI GPT-4o Enrichment</span>
                        <span class="pin-badge-inline" v-if="isNodePinned">
                            <i class="pi pi-bookmark-fill"></i> PINNED
                        </span>
                    </div>
                    <div class="pin-node-body">
                        {{ isNodePinned ? 'Serving cached JSON snapshot instantaneously (0 tokens spent)' : 'Calls live https://api.openai.com/v1/chat/completions (~850ms)' }}
                    </div>
                    <span class="pin-node-tag">{{ isNodePinned ? '0.1ms (Cached)' : '~850ms ($0.05/run)' }}</span>
                </div>

                <div class="pin-arrow"><i class="pi pi-arrow-right"></i></div>

                <div class="pin-node-box">
                    <div class="pin-node-header">3. Linear Issue Creator</div>
                    <div class="pin-node-body">Formats priority &amp; assignee using Step 2 output</div>
                    <span class="pin-node-tag">{{ pinRunResultStatus }}</span>
                </div>
            </div>

            <div class="output-preview-box">
                <div class="output-header">
                    <span><i class="pi pi-info-circle"></i> Simulation Audit Log</span>
                </div>
                <div class="resolved-output-text">{{ pinAuditMessage }}</div>
            </div>
        </div>

        <!-- TAB 4: MCP AI AGENT QUICK-CONNECT & TOOL TESTER -->
        <div v-else-if="activeTab === 'mcp'" class="sandbox-panel">
            <div class="sandbox-grid-2">
                <div class="sandbox-col">
                    <div class="panel-label-bar">
                        <span><i class="pi pi-cog"></i> 1. Copy Agent Client Configuration</span>
                        <div class="client-Toggle-group">
                            <button
                                v-for="client in (['claude', 'cursor', 'http'] as const)"
                                :key="client"
                                type="button"
                                class="preset-chip"
                                :class="{ active: mcpClientType === client }"
                                @click="mcpClientType = client"
                            >
                                {{ client === 'claude' ? 'Claude Desktop' : client === 'cursor' ? 'Cursor IDE' : 'HTTP cURL' }}
                            </button>
                        </div>
                    </div>

                    <div class="step-code-block">
                        <div class="code-block-header">
                            <span>{{ mcpConfigFilename }}</span>
                            <button type="button" class="copy-code-btn" @click="copyMcpConfig">
                                <i class="pi" :class="mcpCopied ? 'pi-check' : 'pi-copy'"></i>
                                <span>{{ mcpCopied ? 'Copied!' : 'Copy Config' }}</span>
                            </button>
                        </div>
                        <pre class="code-block-pre"><code>{{ currentMcpConfigSnippet }}</code></pre>
                    </div>
                </div>

                <div class="sandbox-col">
                    <div class="panel-label-bar">
                        <span><i class="pi pi-wrench"></i> 2. Test Native MCP Tool Invocation</span>
                    </div>

                    <div class="mcp-tools-bar">
                        <button
                            v-for="tool in mcpTools"
                            :key="tool.name"
                            type="button"
                            class="preset-chip"
                            :class="{ active: selectedMcpTool === tool.name }"
                            @click="invokeMcpTool(tool.name)"
                        >
                            <code>{{ tool.name }}</code>
                        </button>
                    </div>

                    <div class="output-preview-box dark-terminal">
                        <div class="output-header">
                            <span>JSON-RPC 2.0 Response (<code>{{ selectedMcpTool }}</code>)</span>
                            <span class="status-tag success">MCP 2.0 OK</span>
                        </div>
                        <pre class="terminal-json">{{ currentMcpToolResponse }}</pre>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { SANDBOX_SCRIPT_PRESETS } from '../Help.constants';

defineProps<{
    activeTab: 'variables' | 'goja' | 'pindata' | 'mcp';
}>();

const emit = defineEmits<{
    (e: 'update:activeTab', tab: 'variables' | 'goja' | 'pindata' | 'mcp'): void;
}>();

// --- TAB 1: VARIABLE PILLS STATE ---
const defaultVarJson = JSON.stringify(
    {
        user: {
            name: 'Aria Montgomery',
            email: 'aria@floowsynk.io',
            role: 'Staff SRE'
        },
        order: {
            id: 'ORD-2026-8841',
            amount: 499.0,
            plan: 'Enterprise Annual'
        }
    },
    null,
    2
);

const varInputJson = ref(defaultVarJson);
const templateExpression = ref(
    'Hello {{ $input.user.name }} ({{ $input.user.role }}),\nYour order {{ $input.order.id }} for {{ $input.order.plan }} (${{ $input.order.amount }}) has been provisioned in {{ $vars.environment }}!'
);

const availableVariablePills = [
    { token: '{{ $input.user.name }}', sample: 'Aria Montgomery' },
    { token: '{{ $input.user.email }}', sample: 'aria@floowsynk.io' },
    { token: '{{ $input.order.id }}', sample: 'ORD-2026-8841' },
    { token: '{{ $input.order.amount }}', sample: '499' },
    { token: '{{ $vars.environment }}', sample: 'staging' },
    { token: '{{ $vars.region }}', sample: 'us-east-1' }
];

function insertVariableToken(token: string) {
    templateExpression.value += ` ${token}`;
}

function resetVariableTemplate() {
    varInputJson.value = defaultVarJson;
    templateExpression.value =
        'Hello {{ $input.user.name }} ({{ $input.user.role }}),\nYour order {{ $input.order.id }} for {{ $input.order.plan }} (${{ $input.order.amount }}) has been provisioned in {{ $vars.environment }}!';
}

function resolvePath(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

function getStoredEnv(): string {
    try {
        if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
            return localStorage.getItem('app_environment') || 'staging';
        }
    } catch {
        // Fallback for test environments
    }
    return 'staging';
}

const evaluatedTemplateResult = computed(() => {
    let parsedInput: Record<string, any> = {};
    try {
        parsedInput = JSON.parse(varInputJson.value);
    } catch {
        return '[Invalid $input JSON syntax — please check brackets and quotes]';
    }

    const context: Record<string, any> = {
        $input: parsedInput,
        $vars: {
            environment: getStoredEnv(),
            region: 'us-east-1'
        }
    };

    return templateExpression.value.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, rawExpr: string) => {
        const val = resolvePath(context, rawExpr.trim());
        return val !== undefined ? String(val) : `<unresolved: ${rawExpr.trim()}>`;
    });
});

// --- TAB 2: GOJA JS RUNNER STATE ---
const scriptPresets = SANDBOX_SCRIPT_PRESETS;
const activePresetId = ref(scriptPresets[0].id);
const gojaInputJson = ref(scriptPresets[0].inputJson);
const gojaCode = ref(scriptPresets[0].code);
const gojaOutputJson = ref('');
const gojaConsoleLogs = ref<string[]>([]);
const gojaError = ref<string | null>(null);
const gojaExecDurationMs = ref<number | null>(null);

function selectScriptPreset(id: string) {
    const found = scriptPresets.find((p) => p.id === id);
    if (!found) return;
    activePresetId.value = found.id;
    gojaInputJson.value = found.inputJson;
    gojaCode.value = found.code;
    executeGojaSandbox();
}

function executeGojaSandbox() {
    gojaError.value = null;
    gojaConsoleLogs.value = [];
    const startTime = performance.now();

    let parsedInput: any;
    try {
        parsedInput = JSON.parse(gojaInputJson.value);
    } catch (err: any) {
        gojaError.value = `Invalid $input JSON: ${err.message}`;
        return;
    }

    const mockVars = {
        environment: getStoredEnv(),
        workflowId: 'wf_demo_sandbox'
    };

    const customConsole = {
        log: (...args: any[]) => {
            gojaConsoleLogs.value.push(
                args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
            );
        }
    };

    try {
        const fn = new Function('$input', '$vars', 'console', gojaCode.value);
        const result = fn(parsedInput, mockVars, customConsole);
        gojaExecDurationMs.value = +(performance.now() - startTime).toFixed(2);
        gojaOutputJson.value = JSON.stringify(result, null, 2);
    } catch (err: any) {
        gojaExecDurationMs.value = +(performance.now() - startTime).toFixed(2);
        gojaError.value = err.message || String(err);
    }
}

// --- TAB 3: PIN DATA SIMULATOR STATE ---
const isNodePinned = ref(true);
const isSimulatingRun = ref(false);
const lastPinRunMs = ref(1.2);
const liveApiCallsCount = ref(1);
const apiCreditsSaved = ref(0.15);
const pinRunResultStatus = ref('Ready');
const pinAuditMessage = ref(
    'Node 2 (OpenAI GPT-4o) is currently PINNED. Clicking "Run Downstream Test" will skip the external HTTP call and immediately feed the frozen JSON response to Node 3 (Linear).'
);

function simulatePinDataRun() {
    isSimulatingRun.value = true;
    pinRunResultStatus.value = 'Running...';

    if (isNodePinned.value) {
        setTimeout(() => {
            isSimulatingRun.value = false;
            lastPinRunMs.value = +(0.9 + Math.random() * 0.6).toFixed(1);
            apiCreditsSaved.value += 0.05;
            pinRunResultStatus.value = '200 OK (Instant)';
            pinAuditMessage.value = `[PINNED RUN COMPLETED IN ${lastPinRunMs.value}ms] Reused frozen snapshot from Node 2. 0 external API tokens consumed! Total saved: $${apiCreditsSaved.value.toFixed(2)}.`;
        }, 120);
    } else {
        setTimeout(() => {
            isSimulatingRun.value = false;
            lastPinRunMs.value = Math.round(780 + Math.random() * 210);
            liveApiCallsCount.value += 1;
            pinRunResultStatus.value = '200 OK (Live)';
            pinAuditMessage.value = `[LIVE API RUN COMPLETED IN ${lastPinRunMs.value}ms] Called external OpenAI endpoint and incurred $0.05 token usage. Tip: Toggle "Pin Node Output" to freeze this response while iterating on Node 3!`;
        }, 650);
    }
}

// --- TAB 4: MCP AI AGENT CONNECT STATE ---
const mcpClientType = ref<'claude' | 'cursor' | 'http'>('claude');
const mcpCopied = ref(false);
const selectedMcpTool = ref('floowsynk_list_workflows');

const mcpConfigFilename = computed(() => {
    if (mcpClientType.value === 'claude') return '~/Library/Application Support/Claude/claude_desktop_config.json';
    if (mcpClientType.value === 'cursor') return '.cursor/mcp.json';
    return 'HTTP JSON-RPC 2.0 Request';
});

const currentMcpConfigSnippet = computed(() => {
    if (mcpClientType.value === 'claude' || mcpClientType.value === 'cursor') {
        return JSON.stringify(
            {
                mcpServers: {
                    floowsynk: {
                        command: 'go',
                        args: ['run', 'Server/mcp/cmd/main.go'],
                        cwd: '/Users/raenard/Documents/floowsynk'
                    }
                }
            },
            null,
            2
        );
    }
    return `curl -X POST http://localhost:8091/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "${selectedMcpTool.value}",
      "arguments": {}
    }
  }'`;
});

const mcpTools = [
    {
        name: 'floowsynk_list_workflows',
        response: {
            jsonrpc: '2.0',
            id: 1,
            result: {
                workflows: [
                    { id: 'wf_01', name: 'Stripe VIP Order Triage', nodes: 6, status: 'active', env: 'staging' },
                    { id: 'wf_02', name: 'RAG Support Auto-Responder', nodes: 5, status: 'active', env: 'production' }
                ]
            }
        }
    },
    {
        name: 'floowsynk_get_workflow',
        response: {
            jsonrpc: '2.0',
            id: 2,
            result: {
                id: 'wf_01',
                name: 'Stripe VIP Order Triage',
                trigger: 'webhook',
                nodes: ['webhook', 'code (goja)', 'condition', 'linear', 'slack', 'response']
            }
        }
    },
    {
        name: 'floowsynk_execute_workflow',
        response: {
            jsonrpc: '2.0',
            id: 3,
            result: {
                executionId: 'exec_99481a',
                status: 'COMPLETED',
                durationMs: 38.4,
                output: { ok: true, routedTo: '#vip-deals' }
            }
        }
    },
    {
        name: 'floowsynk_list_connectors',
        response: {
            jsonrpc: '2.0',
            id: 4,
            result: {
                totalConnectors: 31,
                featured: ['linear', 'supabase', 'pinecone', 'resend', 'sentry', 'openai', 'anthropic', 'slack', 'github']
            }
        }
    }
];

const currentMcpToolResponse = computed(() => {
    const found = mcpTools.find((t) => t.name === selectedMcpTool.value) || mcpTools[0];
    return JSON.stringify(found.response, null, 2);
});

function invokeMcpTool(name: string) {
    selectedMcpTool.value = name;
}

function copyMcpConfig() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(currentMcpConfigSnippet.value).catch(() => {});
    }
    mcpCopied.value = true;
    setTimeout(() => {
        mcpCopied.value = false;
    }, 1800);
}

onMounted(() => {
    executeGojaSandbox();
});
</script>

<style scoped>
.sandbox-wrapper {
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--shadow-sm);
}

.section-header-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border, #e2e8f0);
}

.section-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-primary, #4f46e5);
    margin-bottom: 4px;
}

.section-heading {
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--color-text-primary, #0f172a);
    margin: 0 0 4px 0;
}

.section-subheading {
    font-size: 0.86rem;
    color: var(--color-text-secondary, #475569);
    margin: 0;
    max-width: 680px;
}

.sandbox-tabs {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.sandbox-tab-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 14px;
    border-radius: 10px;
    border: 1px solid var(--color-border, #cbd5e1);
    background: var(--color-surface-hover, #f8fafc);
    color: var(--color-text-secondary, #334155);
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.18s ease;
}

.sandbox-tab-btn:hover {
    border-color: #6366f1;
    color: #4f46e5;
}

.sandbox-tab-btn.active {
    background: linear-gradient(135deg, #4f46e5, #06b6d4);
    color: #ffffff;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}

.sandbox-grid-2 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 20px;
}

.sandbox-col {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.panel-label-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--color-text-primary, #1e293b);
}

.pill-hint {
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--color-text-muted, #64748b);
}

.variable-pills-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.var-pill-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 999px;
    background: rgba(79, 70, 229, 0.08);
    border: 1px solid rgba(79, 70, 229, 0.28);
    color: var(--color-primary, #4f46e5);
    font-size: 0.73rem;
    cursor: pointer;
    transition: all 0.15s ease;
}

.var-pill-chip:hover {
    background: rgba(79, 70, 229, 0.16);
    transform: translateY(-1px);
}

.pill-preview {
    color: var(--color-text-muted, #64748b);
    font-size: 0.68rem;
}

.field-caption {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary, #475569);
}

.code-textarea {
    width: 100%;
    border-radius: 10px;
    border: 1px solid var(--color-border, #cbd5e1);
    background: #0f172a;
    color: #e2e8f0;
    padding: 12px;
    font-family: 'Fira Code', 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    line-height: 1.5;
    resize: vertical;
}

.code-textarea:focus {
    outline: 2px solid #6366f1;
    border-color: transparent;
}

.output-preview-box {
    border-radius: 10px;
    border: 1px solid rgba(16, 185, 129, 0.35);
    background: rgba(16, 185, 129, 0.06);
    padding: 12px 14px;
}

.output-preview-box.dark-terminal {
    background: #0b1120;
    border-color: #1e293b;
    color: #e2e8f0;
}

.output-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.75rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--color-text-primary, #0f172a);
}

.dark-terminal .output-header {
    color: #94a3b8;
}

.eval-badge,
.exec-time-badge {
    font-size: 0.68rem;
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(16, 185, 129, 0.18);
    color: #059669;
    font-weight: 700;
}

.resolved-output-text {
    white-space: pre-wrap;
    font-family: 'Inter', sans-serif;
    font-size: 0.86rem;
    line-height: 1.55;
    color: var(--color-text-primary, #0f172a);
}

/* Goja Runner Controls */
.preset-selector-bar,
.mcp-tools-bar,
.client-Toggle-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}

.preset-label {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--color-text-secondary, #475569);
}

.preset-chip {
    padding: 5px 11px;
    border-radius: 999px;
    border: 1px solid var(--color-border, #cbd5e1);
    background: var(--color-surface-hover, #f8fafc);
    color: var(--color-text-secondary, #334155);
    font-size: 0.74rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
}

.preset-chip.active {
    background: #4f46e5;
    color: #ffffff;
    border-color: #4f46e5;
}

.run-script-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 13px;
    border-radius: 8px;
    border: none;
    background: #10b981;
    color: #ffffff;
    font-size: 0.76rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
}

.run-script-btn:hover {
    background: #059669;
}

.mini-reset-btn {
    padding: 4px 9px;
    border-radius: 6px;
    border: 1px solid var(--color-border, #cbd5e1);
    background: transparent;
    color: var(--color-text-muted, #64748b);
    font-size: 0.7rem;
    cursor: pointer;
}

.console-log-list {
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px dashed #334155;
    font-family: monospace;
    font-size: 0.74rem;
    color: #38bdf8;
}

.log-prefix {
    color: #64748b;
}

.terminal-json {
    margin: 0;
    font-family: 'Fira Code', monospace;
    font-size: 0.75rem;
    color: #a7f3d0;
    overflow-x: auto;
    max-height: 210px;
}

.terminal-error {
    margin: 0;
    color: #fca5a5;
    font-family: monospace;
    font-size: 0.76rem;
}

.status-tag {
    padding: 2px 7px;
    border-radius: 999px;
    font-size: 0.66rem;
    font-weight: 700;
}

.status-tag.success {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
}

.status-tag.error {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
}

/* Pin Data Simulator */
.pindata-explainer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px;
    margin-bottom: 18px;
}

.pindata-status-group,
.pindata-metrics {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}

.pin-toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 14px;
    border-radius: 9px;
    border: 1px solid var(--color-border, #cbd5e1);
    background: var(--color-surface-hover, #f8fafc);
    color: var(--color-text-primary, #1e293b);
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
}

.pin-toggle-btn.pinned {
    background: rgba(245, 158, 11, 0.15);
    border-color: #f59e0b;
    color: #d97706;
}

.metric-pill {
    padding: 6px 12px;
    border-radius: 8px;
    background: var(--color-surface-hover, #f8fafc);
    border: 1px solid var(--color-border, #e2e8f0);
    font-size: 0.76rem;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.metric-pill.saved {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.35);
    color: #059669;
}

.m-val.fast {
    color: #10b981;
}

.pin-pipeline-stage {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

.pin-node-box {
    flex: 1;
    min-width: 200px;
    position: relative;
    padding: 14px 16px;
    border-radius: 12px;
    background: var(--color-surface-hover, #f8fafc);
    border: 1px solid var(--color-border, #cbd5e1);
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.pin-node-box.target-node.pinned {
    border: 2px solid #f59e0b;
    background: rgba(245, 158, 11, 0.06);
}

.pin-node-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 0.84rem;
    font-weight: 700;
    color: var(--color-text-primary, #0f172a);
}

.pin-badge-inline {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #f59e0b;
    color: #ffffff;
    font-size: 0.64rem;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 999px;
    flex-shrink: 0;
}

.pin-node-body {
    font-size: 0.76rem;
    color: var(--color-text-secondary, #475569);
    line-height: 1.4;
}

.pin-node-tag {
    align-self: flex-start;
    margin-top: auto;
    font-size: 0.68rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(99, 102, 241, 0.12);
    color: #4f46e5;
}

.pin-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted, #94a3b8);
}

.step-code-block {
    border-radius: 10px;
    overflow: hidden;
    background: #0f172a;
    border: 1px solid #1e293b;
}

.code-block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #1e293b;
    color: #94a3b8;
    font-size: 0.72rem;
}

.copy-code-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 9px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    font-size: 0.7rem;
    cursor: pointer;
}

.code-block-pre {
    margin: 0;
    padding: 12px 14px;
    color: #e2e8f0;
    font-family: 'Fira Code', monospace;
    font-size: 0.75rem;
    line-height: 1.5;
    overflow-x: auto;
}
</style>
