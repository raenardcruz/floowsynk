import type {
    TourStep,
    SampleWorkflowDefinition,
    SandboxScriptPreset,
    NodeCatalogEntry,
    FaqEntry
} from './Help.types';

export const TOUR_SPEED_MS: Record<'slow' | 'normal' | 'fast', number> = {
    slow: 10000,
    normal: 6000,
    fast: 3000
};

export const SAMPLE_WORKFLOWS: SampleWorkflowDefinition[] = [
    {
        id: 'sample-webhook-pipeline',
        tabId: 'help-sample-webhook',
        title: 'Webhook Data Pipeline & Goja JS',
        badge: 'Data Processing',
        badgeColor: '#10b981',
        category: 'Transformation',
        icon: 'pi pi-bolt',
        description: 'Ingest external webhook orders, transform and calculate VIP discounts using in-process Goja ECMAScript, and emit structured receipts.',
        testInputHint: 'Simulates a POST webhook containing order items, customer details, and price totals.',
        expectedOutcome: 'Calculates 15% VIP discount on totals > $150, formats ISO timestamp, and emits verified receipt output.',
        keyNodes: ['Webhook Trigger (ID: 0)', 'Goja JS Code (ID: 1)', 'Order Receipt Output (ID: 2)'],
        workflow: {
            id: 'help-sample-webhook',
            type: 'default',
            name: 'Webhook & Goja JS Pipeline',
            description: 'Sample workflow demonstrating webhook triggers, Goja JavaScript scripting, and receipt outputs.',
            tagsList: ['Webhook', 'JavaScript', 'VIP-Discount'],
            isnew: false,
            createdat: '2026-10-24T00:00:00Z',
            updatedat: '2026-10-24T00:00:00Z',
            createdby: 'Floowsynk Studio',
            updatedby: 'Floowsynk Studio',
            ismodified: false,
            publishedversionid: '',
            publishedversionnum: 1,
            environment: 0,
            nodesList: [
                {
                    id: '0',
                    nodetype: 'webhook',
                    label: 'Webhook Trigger',
                    draggable: false,
                    position: { x: 60, y: 160 },
                    data: {
                        value: 'https://api.floowsynk.dev/webhook/v1/orders',
                        method: 'POST'
                    },
                    inputsList: [],
                    outputsList: ['output'],
                    groupList: [1],
                    icon: { name: 'webhook', color: 'var(--brown-7)' }
                },
                {
                    id: 'note-1',
                    nodetype: 'stickyNote',
                    label: 'Sticky Note',
                    draggable: true,
                    position: { x: 60, y: 20 },
                    data: {
                        name: 'Live Pipeline Walkthrough',
                        message: '1. Webhook receives raw order payload\n2. Goja JS calculates 15% VIP discount\n3. Emits verified receipt JSON',
                        template: '#fef08a'
                    },
                    inputsList: [],
                    outputsList: [],
                    groupList: [8],
                    icon: { name: 'edit_note', color: 'linear-gradient(135deg, #f59e0b, #d97706)' }
                },
                {
                    id: '1',
                    nodetype: 'code',
                    label: 'Calculate VIP Discount',
                    draggable: true,
                    position: { x: 380, y: 160 },
                    data: {
                        value: `// Process incoming $input items & apply discounts\nconst items = $input?.items || [\n  { sku: 'PRO-LICENSE', price: 120, qty: 2 },\n  { sku: 'RAG-PACK', price: 45, qty: 1 }\n];\nconst subtotal = items.reduce((acc, it) => acc + (it.price * it.qty), 0);\nconst isVip = subtotal > 150;\nconst discountRate = isVip ? 0.15 : 0.05;\nconst finalTotal = subtotal * (1 - discountRate);\n\nreturn {\n  orderId: $input?.orderId || 'ORD-2026-9812',\n  customer: $input?.customer || 'Aria Montgomery',\n  tier: isVip ? 'PLATINUM_VIP' : 'STANDARD',\n  subtotal: subtotal,\n  discountSaved: subtotal * discountRate,\n  finalAmount: finalTotal,\n  processedAt: new Date().toISOString()\n};`,
                        variable: 'order_summary'
                    },
                    inputsList: ['input'],
                    outputsList: ['output'],
                    groupList: [1, 3],
                    icon: { name: 'code', color: 'linear-gradient(135deg, #f59e0b, #ef4444)' }
                },
                {
                    id: '2',
                    nodetype: 'output',
                    label: 'Verified Order Output',
                    draggable: true,
                    position: { x: 720, y: 160 },
                    data: {
                        name: 'Order Receipt Output'
                    },
                    inputsList: ['input'],
                    outputsList: [],
                    groupList: [7],
                    icon: { name: 'output', color: 'var(--blue-5)' }
                }
            ],
            edgesList: [
                {
                    id: 'edge-0-1',
                    source: '0',
                    target: '1',
                    sourceHandle: 'output',
                    targetHandle: 'input',
                    type: 'custom',
                    animated: true
                },
                {
                    id: 'edge-1-2',
                    source: '1',
                    target: '2',
                    sourceHandle: 'output',
                    targetHandle: 'input',
                    type: 'custom',
                    animated: true
                }
            ]
        }
    },
    {
        id: 'sample-linear-triage',
        tabId: 'help-sample-linear',
        title: 'DevOps Incident & Linear Triage',
        badge: 'DevOps Automation',
        badgeColor: '#06b6d4',
        category: 'Connectors',
        icon: 'pi pi-box',
        description: 'Automatically process high-severity Sentry error alerts, extract stack traces in JavaScript, and create prioritized Linear engineering tickets.',
        testInputHint: 'Simulates a critical SSRF security alert from an API gateway service.',
        expectedOutcome: 'Builds markdown ticket description, sets Priority 1 (Urgent), and confirms issue creation.',
        keyNodes: ['Manual Trigger (ID: 0)', 'Alert Formatter (ID: 1)', 'Linear Connector (ID: 2)', 'Ticket Output (ID: 3)'],
        workflow: {
            id: 'help-sample-linear',
            type: 'default',
            name: 'Linear Incident Triage',
            description: 'Sample workflow creating Linear tickets from production error events.',
            tagsList: ['Linear', 'DevOps', 'Incident-Response'],
            isnew: false,
            createdat: '2026-10-24T00:00:00Z',
            updatedat: '2026-10-24T00:00:00Z',
            createdby: 'Floowsynk Studio',
            updatedby: 'Floowsynk Studio',
            ismodified: false,
            publishedversionid: '',
            publishedversionnum: 1,
            environment: 0,
            nodesList: [
                {
                    id: '0',
                    nodetype: 'defaultnode',
                    label: 'Start Incident Triage',
                    draggable: false,
                    position: { x: 60, y: 160 },
                    inputsList: [],
                    outputsList: ['output'],
                    groupList: [1],
                    icon: { name: 'flag_circle', color: 'var(--green-5)' }
                },
                {
                    id: 'note-linear',
                    nodetype: 'stickyNote',
                    label: 'Sticky Note',
                    draggable: true,
                    position: { x: 60, y: 20 },
                    data: {
                        name: 'Security Escalation SOP',
                        message: 'High-severity alerts trigger urgent Linear issues and alert the SecOps engineering on-call rotation.',
                        template: '#fee2e2'
                    },
                    inputsList: [],
                    outputsList: [],
                    groupList: [8],
                    icon: { name: 'edit_note', color: 'linear-gradient(135deg, #f59e0b, #d97706)' }
                },
                {
                    id: '1',
                    nodetype: 'code',
                    label: 'Format Linear Ticket',
                    draggable: true,
                    position: { x: 380, y: 160 },
                    data: {
                        value: `// Format security incident into Linear issue fields\nconst alert = $input?.alert || {\n  service: 'api-gateway',\n  error: 'SSRF blocked request to 169.254.169.254',\n  severity: 'CRITICAL',\n  occurrences: 42\n};\n\nreturn {\n  title: '[' + alert.severity + '] Security Incident: ' + alert.service,\n  description: 'Automated alert: ' + alert.error + '\\nOccurrences in last 5m: ' + alert.occurrences,\n  priority: 1,\n  teamId: 'SEC-OPS',\n  labels: ['security', 'automated-triage']\n};`,
                        variable: 'linear_issue_payload'
                    },
                    inputsList: ['input'],
                    outputsList: ['output'],
                    groupList: [1, 3],
                    icon: { name: 'code', color: 'linear-gradient(135deg, #f59e0b, #ef4444)' }
                },
                {
                    id: '2',
                    nodetype: 'linear',
                    label: 'Create Linear Issue',
                    draggable: true,
                    position: { x: 720, y: 160 },
                    data: {
                        action: 'create_issue',
                        teamId: 'SEC-OPS',
                        title: '{{ $input.title }}',
                        priority: '1'
                    },
                    inputsList: ['input'],
                    outputsList: ['output'],
                    groupList: [4],
                    icon: { name: 'linear', color: '#5e6ad2' }
                },
                {
                    id: '3',
                    nodetype: 'output',
                    label: 'Ticket Confirmation',
                    draggable: true,
                    position: { x: 1040, y: 160 },
                    data: {
                        name: 'Ticket Created Output'
                    },
                    inputsList: ['input'],
                    outputsList: [],
                    groupList: [7],
                    icon: { name: 'output', color: 'var(--blue-5)' }
                }
            ],
            edgesList: [
                {
                    id: 'edge-0-1',
                    source: '0',
                    target: '1',
                    sourceHandle: 'output',
                    targetHandle: 'input',
                    type: 'custom',
                    animated: true
                },
                {
                    id: 'edge-1-2',
                    source: '1',
                    target: '2',
                    sourceHandle: 'output',
                    targetHandle: 'input',
                    type: 'custom',
                    animated: true
                },
                {
                    id: 'edge-2-3',
                    source: '2',
                    target: '3',
                    sourceHandle: 'output',
                    targetHandle: 'input',
                    type: 'custom',
                    animated: true
                }
            ]
        }
    },
    {
        id: 'sample-rag-ai-search',
        tabId: 'help-sample-rag',
        title: 'RAG Knowledge & Vector Search',
        badge: 'AI & Knowledge',
        badgeColor: '#ec4899',
        category: 'AI & Vector',
        icon: 'pi pi-bolt',
        description: 'Ground AI answers with verified documentation chunks using Floowsynk RAG semantic vector retrieval and preprocessing.',
        testInputHint: 'Simulates a user question: "How does Pin Data work in Floowsynk?".',
        expectedOutcome: 'Cleans query, performs vector similarity search in nomic-embed-text collection, and returns top 3 documentation matches.',
        keyNodes: ['Webhook Trigger (ID: 0)', 'Query Preprocessor (ID: 1)', 'RAG Vector Search (ID: 2)', 'Enriched Context (ID: 3)'],
        workflow: {
            id: 'help-sample-rag',
            type: 'default',
            name: 'RAG Semantic Retrieval',
            description: 'Sample workflow retrieving semantic context from Floowsynk knowledge collections.',
            tagsList: ['RAG', 'Vector-Search', 'Embeddings'],
            isnew: false,
            createdat: '2026-10-24T00:00:00Z',
            updatedat: '2026-10-24T00:00:00Z',
            createdby: 'Floowsynk Studio',
            updatedby: 'Floowsynk Studio',
            ismodified: false,
            publishedversionid: '',
            publishedversionnum: 1,
            environment: 0,
            nodesList: [
                {
                    id: '0',
                    nodetype: 'webhook',
                    label: 'Incoming User Query',
                    draggable: false,
                    position: { x: 60, y: 160 },
                    data: {
                        value: 'https://api.floowsynk.dev/rag/ask',
                        method: 'POST'
                    },
                    inputsList: [],
                    outputsList: ['output'],
                    groupList: [1],
                    icon: { name: 'webhook', color: 'var(--brown-7)' }
                },
                {
                    id: 'note-rag',
                    nodetype: 'stickyNote',
                    label: 'Sticky Note',
                    draggable: true,
                    position: { x: 60, y: 20 },
                    data: {
                        name: 'Semantic Grounding Zone',
                        message: 'RAG node retrieves top 3 semantic matches from local Ollama embeddings collection to ground LLM reasoning.',
                        template: '#dbeafe'
                    },
                    inputsList: [],
                    outputsList: [],
                    groupList: [8],
                    icon: { name: 'edit_note', color: 'linear-gradient(135deg, #f59e0b, #d97706)' }
                },
                {
                    id: '1',
                    nodetype: 'code',
                    label: 'Normalize Query',
                    draggable: true,
                    position: { x: 380, y: 160 },
                    data: {
                        value: `// Normalize user question for embedding search\nconst rawQuery = $input?.question || 'How do I pin node data in Floowsynk?';\nreturn {\n  cleanQuery: String(rawQuery).trim().toLowerCase(),\n  topK: 3,\n  collection: 'floowsynk-docs-v2',\n  timestamp: Date.now()\n};`,
                        variable: 'vector_query'
                    },
                    inputsList: ['input'],
                    outputsList: ['output'],
                    groupList: [1, 3],
                    icon: { name: 'code', color: 'linear-gradient(135deg, #f59e0b, #ef4444)' }
                },
                {
                    id: '2',
                    nodetype: 'rag',
                    label: 'RAG Vector Search',
                    draggable: true,
                    position: { x: 720, y: 160 },
                    data: {
                        query: '{{ $input.cleanQuery }}',
                        topK: 3,
                        threshold: 0.78
                    },
                    inputsList: ['input'],
                    outputsList: ['output'],
                    groupList: [2],
                    icon: { name: 'bolt', color: '#ec4899' }
                },
                {
                    id: '3',
                    nodetype: 'output',
                    label: 'Enriched Context Output',
                    draggable: true,
                    position: { x: 1040, y: 160 },
                    data: {
                        name: 'RAG Context Result'
                    },
                    inputsList: ['input'],
                    outputsList: [],
                    groupList: [7],
                    icon: { name: 'output', color: 'var(--blue-5)' }
                }
            ],
            edgesList: [
                {
                    id: 'edge-0-1',
                    source: '0',
                    target: '1',
                    sourceHandle: 'output',
                    targetHandle: 'input',
                    type: 'custom',
                    animated: true
                },
                {
                    id: 'edge-1-2',
                    source: '1',
                    target: '2',
                    sourceHandle: 'output',
                    targetHandle: 'input',
                    type: 'custom',
                    animated: true
                },
                {
                    id: 'edge-2-3',
                    source: '2',
                    target: '3',
                    sourceHandle: 'output',
                    targetHandle: 'input',
                    type: 'custom',
                    animated: true
                }
            ]
        }
    },
    {
        id: 'sample-condition-routing',
        tabId: 'help-sample-routing',
        title: 'Multi-Branch Conditional Router',
        badge: 'Logic & Control',
        badgeColor: '#6366f1',
        category: 'Logic Flow',
        icon: 'pi pi-directions',
        description: 'Scheduled interval cron monitoring server health metrics and dynamically routing between high-priority escalation and normal archiving.',
        testInputHint: 'Generates telemetry CPU sample between 60% and 95%.',
        expectedOutcome: 'Evaluates cpuUsage > 85%. Emits to High Priority Escalation if true, or Telemetry Archive if false.',
        keyNodes: ['Interval Trigger (ID: 0)', 'Metrics Formatter (ID: 1)', 'Escalation Branch (ID: 2)', 'Normal Archive (ID: 3)'],
        workflow: {
            id: 'help-sample-routing',
            type: 'default',
            name: 'Conditional Health Router',
            description: 'Sample workflow branching based on telemetry thresholds.',
            tagsList: ['Logic', 'Conditional', 'Monitoring'],
            isnew: false,
            createdat: '2026-10-24T00:00:00Z',
            updatedat: '2026-10-24T00:00:00Z',
            createdby: 'Floowsynk Studio',
            updatedby: 'Floowsynk Studio',
            ismodified: false,
            publishedversionid: '',
            publishedversionnum: 1,
            environment: 0,
            nodesList: [
                {
                    id: '0',
                    nodetype: 'interval',
                    label: 'Every 5m Health Check',
                    draggable: false,
                    position: { x: 60, y: 190 },
                    data: {
                        interval: 5,
                        type: 'minutes'
                    },
                    inputsList: [],
                    outputsList: ['output'],
                    groupList: [1],
                    icon: { name: 'calendar_month', color: 'var(--blue-6)' }
                },
                {
                    id: 'group-zone',
                    nodetype: 'visualGroup',
                    label: 'Visual Group',
                    draggable: true,
                    position: { x: 340, y: 30 },
                    data: {
                        name: 'Decision & Routing Subsystem',
                        message: 'Parallel branches dynamically separate alert notification from telemetry data archiving.',
                        template: 'rgba(99, 102, 241, 0.08)'
                    },
                    inputsList: [],
                    outputsList: [],
                    groupList: [8],
                    icon: { name: 'select_all', color: 'linear-gradient(135deg, #6366f1, #3b82f6)' }
                },
                {
                    id: '1',
                    nodetype: 'code',
                    label: 'Sample Cluster Telemetry',
                    draggable: true,
                    position: { x: 380, y: 190 },
                    data: {
                        value: `// Sample telemetry data and determine routing\nconst cpuUsage = Math.floor(Math.random() * 35) + 65;\nconst isCritical = cpuUsage > 85;\n\nreturn {\n  cluster: 'us-east-prod-1',\n  cpu: cpuUsage + '%',\n  memory: '78%',\n  status: isCritical ? 'CRITICAL_ALERT' : 'HEALTHY',\n  routedBranch: isCritical ? 'ESCALATE' : 'ARCHIVE',\n  sampledAt: new Date().toISOString()\n};`,
                        variable: 'telemetry'
                    },
                    inputsList: ['input'],
                    outputsList: ['output'],
                    groupList: [1, 3],
                    icon: { name: 'code', color: 'linear-gradient(135deg, #f59e0b, #ef4444)' }
                },
                {
                    id: '2',
                    nodetype: 'output',
                    label: 'High Priority Escalation',
                    draggable: true,
                    position: { x: 740, y: 110 },
                    data: {
                        name: 'Escalation Alert Output'
                    },
                    inputsList: ['input'],
                    outputsList: [],
                    groupList: [7],
                    icon: { name: 'output', color: 'var(--red-5)' }
                },
                {
                    id: '3',
                    nodetype: 'output',
                    label: 'Normal Telemetry Archive',
                    draggable: true,
                    position: { x: 740, y: 270 },
                    data: {
                        name: 'Normal Log Archive Output'
                    },
                    inputsList: ['input'],
                    outputsList: [],
                    groupList: [7],
                    icon: { name: 'output', color: 'var(--green-5)' }
                }
            ],
            edgesList: [
                {
                    id: 'edge-0-1',
                    source: '0',
                    target: '1',
                    sourceHandle: 'output',
                    targetHandle: 'input',
                    type: 'custom',
                    animated: true
                },
                {
                    id: 'edge-1-2',
                    source: '1',
                    target: '2',
                    sourceHandle: 'output',
                    targetHandle: 'input',
                    type: 'custom',
                    animated: true
                },
                {
                    id: 'edge-1-3',
                    source: '1',
                    target: '3',
                    sourceHandle: 'output',
                    targetHandle: 'input',
                    type: 'custom',
                    animated: true
                }
            ]
        }
    }
];

export const TOUR_STEPS: TourStep[] = [
    {
        id: 'step-architecture',
        stepNumber: 1,
        shortTitle: 'System Core',
        title: 'The Floowsynk DAG Architecture & Mental Model',
        badge: 'Chapter 1 • Foundation',
        badgeColor: '#6366f1',
        icon: 'pi pi-server',
        summary: 'Floowsynk is a high-throughput Workflow Automation Platform powered by a concurrent Go DAG engine and a live Vue 3 canvas. Every workflow is a Directed Acyclic Graph (DAG) where data flows from Triggers through Logic, Scripting, AI Vector Search, and External Connectors.',
        highlights: [
            {
                title: 'Zero-Allocation Fast Path',
                description: 'Compiled LRU template caching resolves variable expressions in nanoseconds without memory bottlenecks.',
                icon: 'pi pi-bolt'
            },
            {
                title: 'Diamond Fan-In & Cycle Guards',
                description: 'Parallel branches automatically synchronize at join nodes (isJoinReady) while MaxStepLimit prevents infinite loops.',
                icon: 'pi pi-share-alt'
            },
            {
                title: 'Async Kafka Replay Logging',
                description: 'Execution traces are batched asynchronously into PostgreSQL so live workflows never block on database I/O.',
                icon: 'pi pi-database'
            }
        ],
        proTip: 'Look at the live canvas on the right! You are interacting with the actual Floowsynk workflow engine—click "Run Workflow Test" anytime to see live execution in action.',
        codeSnippet: {
            title: 'DAG Execution Flow',
            language: 'text',
            code: `[Trigger: Webhook/Interval] 
   ├──> [Branch A: Goja JS Transform] ──┐
   └──> [Branch B: RAG Vector Query]  ──┼──> [Join: Connector Action] ──> [HTTP Response]`
        },
        actionLink: {
            label: 'Open Full Workflow Canvas',
            to: '/workflow',
            icon: 'pi pi-sitemap'
        },
        targetSampleId: 'sample-webhook-pipeline',
        focusNodeId: '0'
    },
    {
        id: 'step-canvas',
        stepNumber: 2,
        shortTitle: 'DAG Canvas',
        title: 'Building on the Canvas: Triggers, Pin Data & Variable Pills',
        badge: 'Chapter 2 • Canvas UX',
        badgeColor: '#f59e0b',
        icon: 'pi pi-sitemap',
        summary: 'The Workflow Canvas is your visual development environment. Drag nodes from the left palette, connect output handles to input handles, and use Pin Data to freeze real test payloads.',
        highlights: [
            {
                title: 'Pin Data (Zero-Cost Debugging)',
                description: 'Freeze the output JSON of any node in the inspector. Subsequent test runs reuse the pinned payload without calling external APIs or spending LLM tokens.',
                icon: 'pi pi-bookmark'
            },
            {
                title: 'Draggable Variable Pills',
                description: 'Reference upstream outputs using {{ $input.field }} or workflow variables using {{ $vars.name }}.',
                icon: 'pi pi-tag'
            },
            {
                title: 'Sticky Notes & Visual Groups',
                description: 'Document your architecture directly on the canvas using Markdown Sticky Notes and color-coded Visual Group zones.',
                icon: 'pi pi-clone'
            }
        ],
        proTip: 'Click on the "Webhook Trigger" node or "Sticky Note" on the live canvas right now to select it and inspect its configuration!',
        codeSnippet: {
            title: 'Variable Template Syntax Examples',
            language: 'handlebars',
            code: `// Access incoming payload from immediate parent node
Authorization: Bearer {{ $input.auth.token }}

// Reference named workflow variable set earlier
https://api.example.com/v1/users/{{ $vars.customer_id }}/orders`
        },
        actionLink: {
            label: 'Open Workflow Canvas',
            to: '/workflow',
            icon: 'pi pi-sitemap'
        },
        targetSampleId: 'sample-webhook-pipeline',
        focusNodeId: 'note-1'
    },
    {
        id: 'step-goja',
        stepNumber: 3,
        shortTitle: 'Goja JS Code',
        title: 'Sandboxed JavaScript Scripting (Goja Engine)',
        badge: 'Chapter 3 • Custom Code',
        badgeColor: '#10b981',
        icon: 'pi pi-code',
        summary: 'When built-in nodes are not enough, drop a Code (JavaScript) node onto the canvas. Floowsynk executes your script inside an isolated, in-process Goja ECMAScript VM with zero container cold-start delay.',
        highlights: [
            {
                title: 'Native $input & $vars Binding',
                description: 'Read incoming data via $input, access global workflow state via $vars, and return any JSON-serializable object or array.',
                icon: 'pi pi-sliders-h'
            },
            {
                title: 'Strict 5-Second Timeout Guard',
                description: 'Accidental infinite loops are automatically halted after 5 seconds to protect server worker threads.',
                icon: 'pi pi-shield'
            },
            {
                title: 'Built-In Console Capture',
                description: 'Use console.log() inside your script to emit structured debugging traces directly into the Workflow Replay drawer.',
                icon: 'pi pi-terminal'
            }
        ],
        proTip: 'Click on the "Calculate VIP Discount" code node on the canvas to open the real code editor and modify the calculation live!',
        codeSnippet: {
            title: 'Sample Goja Code Node Script',
            language: 'javascript',
            code: `// Filter high-priority items and enrich with timestamp
const items = Array.isArray($input) ? $input : [$input];
return items
  .filter(item => item.amount >= 100)
  .map(item => ({
    ...item,
    tier: 'VIP',
    processedBy: $vars.environment || 'staging'
  }));`
        },
        actionLink: {
            label: 'Try in Full Workflow Editor',
            to: '/workflow',
            icon: 'pi pi-code'
        },
        targetSampleId: 'sample-webhook-pipeline',
        focusNodeId: '1'
    },
    {
        id: 'step-connectors',
        stepNumber: 4,
        shortTitle: '31+ Connectors',
        title: 'Enterprise Connectors & Linear Triage',
        badge: 'Chapter 4 • Connectivity',
        badgeColor: '#06b6d4',
        icon: 'pi pi-box',
        summary: 'Connect to over 31 modern SaaS, database, and AI platforms out of the box—or call any endpoint with the HTTP API node. Credentials are encrypted at rest using AES-256 and injected only at execution time.',
        highlights: [
            {
                title: 'Modern Dev & AI Stack',
                description: 'Native templates for Linear, Supabase, Pinecone, Resend, Sentry, OpenAI, Anthropic Claude, Google Gemini, GitHub, and Slack.',
                icon: 'pi pi-sparkles'
            },
            {
                title: 'Reusable Encrypted Credentials',
                description: 'Configure API keys or OAuth2 credentials once in the Connectors hub and share them safely across workflows.',
                icon: 'pi pi-lock'
            },
            {
                title: 'Automatic SSRF Protection',
                description: 'Outbound HTTP requests automatically block loopback and cloud metadata subnets (127.0.0.0/8, 169.254.0.0/16, 10.0.0.0/8).',
                icon: 'pi pi-verified'
            }
        ],
        proTip: 'Switch to the "DevOps Incident & Linear Triage" sample workflow above the canvas to see a real Linear integration node in action!',
        codeSnippet: {
            title: 'Declarative Connector Action Flow',
            language: 'json',
            code: `{
  "connector": "linear",
  "action": "create_issue",
  "teamId": "{{ $vars.eng_team_id }}",
  "title": "Automated Alert: {{ $input.error_summary }}",
  "priority": 1
}`
        },
        actionLink: {
            label: 'Explore Connectors Hub',
            to: '/connectors',
            icon: 'pi pi-box'
        },
        targetSampleId: 'sample-linear-triage',
        focusNodeId: '2'
    },
    {
        id: 'step-rag',
        stepNumber: 5,
        shortTitle: 'RAG Knowledge',
        title: 'RAG Vector Knowledge Base & Semantic Retrieval',
        badge: 'Chapter 5 • AI & Vectors',
        badgeColor: '#ec4899',
        icon: 'pi pi-bolt',
        summary: 'Give your automated workflows long-term memory. Upload documentation, runbooks, or product catalogs into the RAG Knowledge Base, and query them semantically inside any workflow.',
        highlights: [
            {
                title: 'Automated Document Chunking',
                description: 'Ingested documents are split into overlapping semantic chunks and converted into high-dimensional vector embeddings.',
                icon: 'pi pi-file-import'
            },
            {
                title: 'Low-Latency Similarity Search',
                description: 'Use the RAG node in your workflow to retrieve the top-K most relevant context snippets based on incoming user questions.',
                icon: 'pi pi-search'
            },
            {
                title: 'Plug-and-Play LLM Grounding',
                description: 'Pipe retrieved RAG context directly into OpenAI, Claude, Gemini, or local Ollama nodes for hallucination-free AI responses.',
                icon: 'pi pi-microchip-ai'
            }
        ],
        proTip: 'Switch to the "RAG Knowledge & Vector Search" sample workflow to see how semantic search integrates with Goja JS preprocessors.',
        codeSnippet: {
            title: 'Prompt Grounding with RAG Output',
            language: 'handlebars',
            code: `System: Answer the customer question using ONLY the verified context below.
Context:
{{ $input.rag_matches }}

Customer Question:
{{ $vars.user_question }}`
        },
        actionLink: {
            label: 'Manage RAG Knowledge',
            to: '/rag',
            icon: 'pi pi-bolt'
        },
        targetSampleId: 'sample-rag-ai-search',
        focusNodeId: '2'
    },
    {
        id: 'step-routing',
        stepNumber: 6,
        shortTitle: 'Logic Routing',
        title: 'Multi-Branch Decision Routing & Visual Groups',
        badge: 'Chapter 6 • Logic & Flow',
        badgeColor: '#6366f1',
        icon: 'pi pi-directions',
        summary: 'Direct execution flow across parallel paths based on dynamic business logic, threshold rules, or payload contents.',
        highlights: [
            {
                title: 'Parallel Branch Execution',
                description: 'Nodes connected to the same output handle execute concurrently, maximizing system throughput.',
                icon: 'pi pi-share-alt'
            },
            {
                title: 'Visual Architecture Zones',
                description: 'Use Visual Group bounding boxes to label functional subsystems and keep complex enterprise graphs organized.',
                icon: 'pi pi-select-all'
            },
            {
                title: 'Diamond Join Synchronization',
                description: 'Parallel execution paths safely converge at downstream join nodes without data loss or race conditions.',
                icon: 'pi pi-check-circle'
            }
        ],
        proTip: 'Switch to the "Multi-Branch Conditional Router" sample workflow to inspect the Visual Group and dual escalation branches.',
        codeSnippet: {
            title: 'Conditional Health Branching',
            language: 'javascript',
            code: `const isCritical = cpuUsage > 85;
return {
  status: isCritical ? 'CRITICAL_ALERT' : 'HEALTHY',
  route: isCritical ? 'ESCALATE' : 'ARCHIVE'
};`
        },
        actionLink: {
            label: 'Open Full Canvas',
            to: '/workflow',
            icon: 'pi pi-sitemap'
        },
        targetSampleId: 'sample-condition-routing',
        focusNodeId: 'group-zone'
    },
    {
        id: 'step-staging',
        stepNumber: 7,
        shortTitle: 'Staging & Prod',
        title: 'Staging vs. Production Isolation & Live Replay Traces',
        badge: 'Chapter 7 • Lifecycle Ops',
        badgeColor: '#3b82f6',
        icon: 'pi pi-sync',
        summary: 'Test fearlessly without risking live operations. Floowsynk provides complete environment isolation inside a single unified server deployment using physical table separation and versioned snapshots.',
        highlights: [
            {
                title: 'Top-Bar Environment Switcher',
                description: 'Toggle between STAGING and PRODUCTION at any time. Each environment maintains isolated database tables (_staging vs _production).',
                icon: 'pi pi-sliders-v'
            },
            {
                title: 'Live Replay Execution Drawer',
                description: 'Running a workflow opens the Replay Drawer showing step-by-step logs, durations, and interactive JSON variable inspectors.',
                icon: 'pi pi-play'
            },
            {
                title: 'One-Click Promotion & Rollback',
                description: 'Promote verified workflows directly to Production or revert to any saved snapshot in Version History.',
                icon: 'pi pi-history'
            }
        ],
        proTip: 'Click "Run Workflow Test" on any sample workflow to see the live Replay Steps drawer slide open with real payload traces!',
        codeSnippet: {
            title: 'Environment Routing Isolation',
            language: 'text',
            code: `STAGING Webhook URL    ──> POST /staging/webhook/:workflow_id  (Writes to *_staging tables)
PRODUCTION Webhook URL ──> POST /webhook/:workflow_id          (Writes to *_production tables)`
        },
        actionLink: {
            label: 'Build Your First Workflow',
            to: '/workflow',
            icon: 'pi pi-play'
        },
        targetSampleId: 'sample-webhook-pipeline',
        focusNodeId: '2'
    }
];

export const SANDBOX_SCRIPT_PRESETS: SandboxScriptPreset[] = [
    {
        id: 'preset-enrich',
        name: 'VIP Order Classifier & Enrichment',
        description: 'Filters orders over $100, calculates tax, and tags VIP customers.',
        inputJson: JSON.stringify(
            [
                { orderId: 'ORD-901', customer: 'Alice Rivera', amount: 240, currency: 'USD' },
                { orderId: 'ORD-902', customer: 'Bob Chen', amount: 45, currency: 'USD' },
                { orderId: 'ORD-903', customer: 'Elena Rostova', amount: 580, currency: 'USD' }
            ],
            null,
            2
        ),
        code: `// Access incoming payload via $input and workflow vars via $vars
const orders = Array.isArray($input) ? $input : [$input];
console.log("Processing " + orders.length + " incoming orders...");

const vipOrders = orders
  .filter(o => o.amount >= 100)
  .map(o => ({
    orderId: o.orderId,
    customer: o.customer,
    subtotal: o.amount,
    estimatedTax: +(o.amount * 0.0825).toFixed(2),
    total: +(o.amount * 1.0825).toFixed(2),
    tier: o.amount >= 500 ? 'PLATINUM_VIP' : 'GOLD_VIP',
    environment: $vars.environment || 'staging'
  }));

console.log("Qualified VIP orders: " + vipOrders.length);
return {
  summary: {
    totalProcessed: orders.length,
    vipCount: vipOrders.length
  },
  vipOrders
};`
    },
    {
        id: 'preset-sanitize',
        name: 'PII Masking & Webhook Sanitizer',
        description: 'Redacts sensitive emails and credit card digits before logging or sending to AI.',
        inputJson: JSON.stringify(
            {
                event: 'user.signup',
                user: {
                    fullName: 'Marcus Vance',
                    email: 'marcus.vance@enterprise.io',
                    cardLast4: '4242-8891-0012-9934',
                    role: 'admin'
                }
            },
            null,
            2
        ),
        code: `const user = $input.user || {};
const emailParts = (user.email || '').split('@');
const maskedEmail = emailParts.length === 2
  ? emailParts[0].slice(0, 2) + '***@' + emailParts[1]
  : 'redacted';

console.log("Masked PII for user: " + maskedEmail);

return {
  event: $input.event,
  sanitizedUser: {
    fullName: user.fullName,
    email: maskedEmail,
    cardRedacted: '****-****-****-' + String(user.cardLast4 || '').slice(-4),
    role: user.role
  },
  securityAudit: 'PASSED_PII_FILTER'
};`
    },
    {
        id: 'preset-aggregation',
        name: 'Telemetry Metrics Aggregator',
        description: 'Computes min, max, average latency and SLA status across service nodes.',
        inputJson: JSON.stringify(
            {
                service: 'payment-gateway',
                samplesMs: [42, 58, 195, 64, 51, 310, 49]
            },
            null,
            2
        ),
        code: `const samples = $input.samplesMs || [];
const sum = samples.reduce((acc, v) => acc + v, 0);
const avg = samples.length ? +(sum / samples.length).toFixed(1) : 0;
const max = Math.max(...samples);
const min = Math.min(...samples);

console.log("Calculated average latency: " + avg + "ms");

return {
  service: $input.service,
  metrics: { count: samples.length, minMs: min, maxMs: max, avgMs: avg },
  slaStatus: avg < 120 ? 'HEALTHY' : 'DEGRADED',
  alertRequired: max > 250
};`
    }
];

export const NODE_CATALOG: NodeCatalogEntry[] = [
    {
        nodetype: 'webhook',
        label: 'Webhook Trigger',
        category: 'Triggers & Input',
        icon: 'pi pi-globe',
        accentColor: '#f59e0b',
        description: 'Exposes an HTTP endpoint to ingest real-time JSON payloads, headers, and query parameters from external services.',
        inputs: ['HTTP Method (GET/POST/PUT)', 'Custom Route Path', 'Auth Header Check'],
        outputs: ['$input.body', '$input.headers', '$input.query'],
        sampleUse: 'Receive Stripe payment succeeded events or GitHub pull request webhooks.',
        examplePayload: '{ "event": "issue.created", "repo": "floowsynk/core", "sender": "alice" }'
    },
    {
        nodetype: 'interval',
        label: 'Interval / Cron Trigger',
        category: 'Triggers & Input',
        icon: 'pi pi-clock',
        accentColor: '#f59e0b',
        description: 'Executes a workflow automatically on a recurring time schedule (seconds, minutes, hours, or cron expression).',
        inputs: ['Interval Value', 'Time Unit (s / m / h / d)', 'Active State'],
        outputs: ['$input.triggeredAt', '$input.iteration'],
        sampleUse: 'Run hourly database cleanup jobs, daily SLA reports, or health checks.',
        examplePayload: '{ "triggeredAt": "2026-10-24T21:00:00Z", "schedule": "every_15m" }'
    },
    {
        nodetype: 'rag',
        label: 'RAG Vector Search',
        category: 'AI & Vector',
        icon: 'pi pi-bolt',
        accentColor: '#ec4899',
        description: 'Queries the Floowsynk RAG Knowledge Base using semantic vector embeddings to retrieve relevant document chunks.',
        inputs: ['Search Query Expression', 'Knowledge Collection ID', 'Top-K Limit'],
        outputs: ['$input.matches', '$input.topContext', '$input.scores'],
        sampleUse: 'Ground customer support LLM responses in verified internal product documentation.',
        examplePayload: '{ "query": "How do I reset MFA?", "topK": 3, "minScore": 0.78 }'
    },
    {
        nodetype: 'condition',
        label: 'Condition (If / Else)',
        category: 'Logic & Control',
        icon: 'pi pi-directions',
        accentColor: '#6366f1',
        description: 'Evaluates boolean expressions or comparisons to dynamically route execution down True or False branches.',
        inputs: ['Left Operand', 'Comparison Operator (==, !=, >, <, contains)', 'Right Operand'],
        outputs: ['True Branch Handle', 'False Branch Handle'],
        sampleUse: 'Route high-value enterprise leads to Slack and standard leads to email nurture.',
        examplePayload: '{ "expression": "{{ $input.amount }} >= 500", "result": true }'
    },
    {
        nodetype: 'foreach',
        label: 'ForEach / Loop',
        category: 'Logic & Control',
        icon: 'pi pi-refresh',
        accentColor: '#6366f1',
        description: 'Iterates over an array of items sequentially or in controlled batches, executing downstream child nodes for each element.',
        inputs: ['Source Array ($input.items)', 'Item Variable Name', 'Max Iterations'],
        outputs: ['$vars.currentItem', '$vars.loopIndex', 'Aggregated Results'],
        sampleUse: 'Process each line item in an invoice or synchronize batches of user records.',
        examplePayload: '{ "source": "{{ $input.records }}", "batchSize": 25 }'
    },
    {
        nodetype: 'subprocess',
        label: 'Subprocess Delegation',
        category: 'Logic & Control',
        icon: 'pi pi-sitemap',
        accentColor: '#6366f1',
        description: 'Invokes another modular Floowsynk workflow as a child subroutine and awaits its structured output.',
        inputs: ['Target Workflow ID', 'Input Payload Mapping'],
        outputs: ['$input.subprocessResult', 'Execution Status'],
        sampleUse: 'Reuse a centralized "Send Multi-Channel Alert" workflow across 20 parent pipelines.',
        examplePayload: '{ "targetWorkflowId": "wf_notify_ops", "payload": "{{ $input }}" }'
    },
    {
        nodetype: 'code',
        label: 'Code (Goja JavaScript)',
        category: 'Custom Scripting',
        icon: 'pi pi-code',
        accentColor: '#10b981',
        description: 'Sandboxed in-process ECMAScript 5.1+ runtime with direct access to $input, $vars, console.log, and 5s timeout guard.',
        inputs: ['JavaScript Code Body', 'Output Variable Binding'],
        outputs: ['Return Value Object/Array', 'Console Trace Logs'],
        sampleUse: 'Complex payload reshaping, cryptographic hashing, regex extraction, or custom scoring.',
        examplePayload: 'return $input.items.map(x => ({ id: x.id, normalized: x.name.trim().toLowerCase() }));'
    },
    {
        nodetype: 'setVariable',
        label: 'Set Variable',
        category: 'Data Transformation',
        icon: 'pi pi-sliders-h',
        accentColor: '#14b8a6',
        description: 'Creates or updates a named workflow variable ($vars.<name>) accessible by all downstream nodes in the DAG.',
        inputs: ['Variable Key Name', 'Value / Template Expression'],
        outputs: ['$vars.<key>'],
        sampleUse: 'Store an authentication token, correlation ID, or normalized customer profile.',
        examplePayload: '{ "variable": "customerTier", "value": "enterprise_plus" }'
    },
    {
        nodetype: 'math',
        label: 'Math Evaluator',
        category: 'Data Transformation',
        icon: 'pi pi-percentage',
        accentColor: '#14b8a6',
        description: 'Safely evaluates arithmetic formulas (+, -, *, /, %, parentheses) without arbitrary code execution.',
        inputs: ['Arithmetic Expression', 'Target Variable'],
        outputs: ['Calculated Numeric Result'],
        sampleUse: 'Compute discounts, currency conversions, token budgets, or retry backoffs.',
        examplePayload: '{ "expression": "({{ $input.price }} * {{ $input.qty }}) * 0.9", "output": 432.0 }'
    },
    {
        nodetype: 'text',
        label: 'Text & Regex Processor',
        category: 'Data Transformation',
        icon: 'pi pi-align-left',
        accentColor: '#14b8a6',
        description: 'Performs string interpolation, regex pattern matching (findAll), substring replacement, and formatting.',
        inputs: ['Source Text', 'Pattern / Replacement Rules'],
        outputs: ['Formatted String / Match Array'],
        sampleUse: 'Compose formatted Markdown messages or extract ticket IDs like ENG-1234 from commit messages.',
        examplePayload: '{ "pattern": "ENG-[0-9]+", "matches": ["ENG-402", "ENG-819"] }'
    },
    {
        nodetype: 'linear',
        label: 'Linear Connector',
        category: 'Connectivity',
        icon: 'pi pi-box',
        accentColor: '#5e6ad2',
        description: 'Create and update issues, projects, cycles, and comments on Linear with team and priority routing.',
        inputs: ['Action (create_issue, update_issue)', 'Team ID', 'Title', 'Priority'],
        outputs: ['$input.id', '$input.url', '$input.status'],
        sampleUse: 'Automatically create engineering tickets from customer feedback or Sentry alerts.',
        examplePayload: '{ "action": "create_issue", "teamId": "ENG", "title": "Fix memory leak" }'
    },
    {
        nodetype: 'supabase',
        label: 'Supabase Connector',
        category: 'Connectivity',
        icon: 'pi pi-database',
        accentColor: '#3ecf8e',
        description: 'Direct PostgreSQL database queries, record insertions, updates, and RPC function calls via Supabase REST API.',
        inputs: ['Table Name', 'Operation (select, insert, update)', 'Payload Data'],
        outputs: ['$input.data', '$input.count', '$input.error'],
        sampleUse: 'Upsert synchronized user profiles or log audit events into a hosted Postgres database.',
        examplePayload: '{ "table": "users", "operation": "insert", "data": { "email": "user@example.com" } }'
    },
    {
        nodetype: 'resend',
        label: 'Resend Email Connector',
        category: 'Connectivity',
        icon: 'pi pi-envelope',
        accentColor: '#000000',
        description: 'Send transactional emails, receipts, and alert notifications with high deliverability via Resend.',
        inputs: ['From Address', 'To Address', 'Subject', 'HTML / Text Body'],
        outputs: ['$input.id', '$input.status'],
        sampleUse: 'Send customer purchase receipts or notify on-call engineers of system alerts.',
        examplePayload: '{ "to": "admin@company.com", "subject": "Alert: High CPU", "html": "<p>CPU at 92%</p>" }'
    },
    {
        nodetype: 'pinecone',
        label: 'Pinecone Vector DB',
        category: 'Connectivity',
        icon: 'pi pi-sitemap',
        accentColor: '#000000',
        description: 'Upsert and query high-dimensional vector embeddings with metadata filtering in Pinecone serverless indexes.',
        inputs: ['Index Name', 'Vectors Array', 'Namespace', 'Top-K Limit'],
        outputs: ['$input.matches', '$input.upsertedCount'],
        sampleUse: 'Power semantic recommendation engines or enterprise document search.',
        examplePayload: '{ "index": "docs-index", "topK": 5, "vector": [0.12, -0.45, 0.88] }'
    },
    {
        nodetype: 'sentry',
        label: 'Sentry Connector',
        category: 'Connectivity',
        icon: 'pi pi-exclamation-triangle',
        accentColor: '#e03e2f',
        description: 'Capture exception events, fetch issue details, and resolve alerts in Sentry project tracking.',
        inputs: ['Project Slug', 'Action (capture_message, get_issue)', 'Message / Issue ID'],
        outputs: ['$input.eventId', '$input.issueDetails'],
        sampleUse: 'Log uncaught workflow runtime errors or fetch diagnostics when an alert fires.',
        examplePayload: '{ "action": "capture_message", "message": "Payment gateway timeout" }'
    },
    {
        nodetype: 'connector',
        label: '3rd-Party SaaS Connector',
        category: 'Connectivity',
        icon: 'pi pi-box',
        accentColor: '#06b6d4',
        description: 'Pre-built integration node for 31+ services including Slack, GitHub, OpenAI, and Anthropic.',
        inputs: ['Connector Provider', 'Saved Credential ID', 'Action Template & Fields'],
        outputs: ['Parsed JSON API Response', 'HTTP Status Code'],
        sampleUse: 'Send Slack notifications, create GitHub pull requests, or query OpenAI GPT-4o.',
        examplePayload: '{ "provider": "slack", "action": "send_message", "channel": "#alerts" }'
    },
    {
        nodetype: 'api',
        label: 'HTTP REST API Request',
        category: 'Connectivity',
        icon: 'pi pi-send',
        accentColor: '#06b6d4',
        description: 'Executes custom HTTP/HTTPS requests with dynamic headers, query params, JSON bodies, and built-in SSRF subnet protection.',
        inputs: ['URL Template', 'Method (GET/POST/PUT/PATCH/DELETE)', 'Headers & Body'],
        outputs: ['$input.status', '$input.data', '$input.headers'],
        sampleUse: 'Connect to internal microservices, partner webhooks, or GraphQL endpoints.',
        examplePayload: '{ "method": "POST", "url": "https://api.partner.com/v2/sync", "timeoutMs": 10000 }'
    },
    {
        nodetype: 'stickyNote',
        label: 'Sticky Note & Visual Group',
        category: 'Canvas & Notes',
        icon: 'pi pi-file-edit',
        accentColor: '#eab308',
        description: 'Non-executing visual annotations and bounding subsystem boxes to document architecture directly on the canvas.',
        inputs: ['Title', 'Markdown Note Content', 'Color Theme'],
        outputs: ['Visual Canvas Layer Only'],
        sampleUse: 'Leave onboarding notes for teammates or group error-handling nodes into a labeled zone.',
        examplePayload: '{ "title": "Payment Retry Zone", "note": "Handles idempotent Stripe retries." }'
    },
    {
        nodetype: 'output',
        label: 'Output & Audit Log',
        category: 'Output',
        icon: 'pi pi-check-square',
        accentColor: '#3b82f6',
        description: 'Terminates a workflow with structured output inspection, or displays final execution metrics in Replay Logs.',
        inputs: ['Output Name', 'Target Variable'],
        outputs: ['Execution Result Payload'],
        sampleUse: 'Display the final calculated object or return a custom JSON receipt to a caller.',
        examplePayload: '{ "name": "Order Summary Output" }'
    }
];

export const FAQ_ITEMS: FaqEntry[] = [
    {
        id: 'faq-pin-data',
        category: 'Workflow Canvas',
        question: 'How does "Pin Data" work and why should I use it?',
        answer: 'Pin Data allows you to freeze the JSON output of any node in your workflow. When a node has pinned data, Floowsynk skips executing that node (and its upstream API calls) during test runs and immediately feeds the frozen JSON to downstream nodes. This saves API rate limits, avoids duplicate database writes, and prevents burning OpenAI/Anthropic tokens while you refine downstream logic.',
        tags: ['pin data', 'debugging', 'testing', 'canvas', 'cache']
    },
    {
        id: 'faq-variables',
        category: 'Scripting & Variables',
        question: 'What is the difference between {{ $input }} and {{ $vars }}?',
        answer: '$input always contains the direct output payload returned by the immediately preceding parent node in the DAG. In contrast, $vars is a workflow-wide key-value dictionary that persists across the entire execution run. If you need a value from Step 1 to still be available in Step 6, store it using a "Set Variable" node and reference it via {{ $vars.my_key }}.',
        tags: ['$input', '$vars', 'variables', 'templates', 'pills']
    },
    {
        id: 'faq-goja-timeout',
        category: 'Scripting & Variables',
        question: 'What JavaScript features are supported in the Code node, and what happens on infinite loops?',
        answer: 'The Code node runs on the Goja VM (ECMAScript 5.1+ with modern array methods like .map, .filter, .reduce, JSON, Math, Date, and RegExp). Every execution is wrapped in a strict 5-second context timeout. If a script contains an infinite loop such as while(true){}, the VM interrupts execution at 5,000ms and marks the node with a clear timeout error without impacting other workflows.',
        tags: ['goja', 'javascript', 'code node', 'timeout', 'sandbox']
    },
    {
        id: 'faq-staging-prod',
        category: 'Architecture',
        question: 'How does Staging vs. Production isolation work on a single server?',
        answer: 'Floowsynk separates environments at the physical database table level (_staging vs _production) while running inside a single unified Go server binary. Switching the dropdown in the top navbar from STAGING to PRODUCTION routes all API calls and webhook triggers accordingly. You can promote a tested Staging workflow to Production in one click or roll back using Version History snapshots.',
        tags: ['staging', 'production', 'environment', 'promotion', 'rollback', 'version history']
    },
    {
        id: 'faq-ssrf',
        category: 'Connectors & Auth',
        question: 'Why was my HTTP API request blocked with an SSRF protection error?',
        answer: 'To protect infrastructure security, Floowsynk enforces built-in Server-Side Request Forgery (SSRF) guards on external HTTP API nodes. Requests targeting loopback addresses (127.0.0.0/8, localhost), private RFC1918 networks (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), or cloud instance metadata endpoints (169.254.169.254) are blocked by default unless explicitly permitted in server configuration.',
        tags: ['ssrf', 'security', 'api node', 'blocked ip', 'localhost']
    },
    {
        id: 'faq-mcp-setup',
        category: 'MCP Agent Protocol',
        question: 'How do I connect Claude Desktop, Cursor, or Antigravity to Floowsynk via MCP?',
        answer: 'Floowsynk exposes a JSON-RPC 2.0 Model Context Protocol server over both HTTP (POST http://localhost:8091/api/mcp) and Stdio (make mcp-stdio). Add the command configuration to your claude_desktop_config.json or Cursor MCP settings. Your AI assistant will immediately gain 4 tools to list workflows, inspect node graphs, list connectors, and trigger workflow executions.',
        tags: ['mcp', 'claude', 'cursor', 'antigravity', 'ai agent', 'json-rpc']
    },
    {
        id: 'faq-rag-setup',
        category: 'RAG & AI',
        question: 'How do I use the RAG Knowledge Base in my workflows?',
        answer: 'First, navigate to the "RAG Knowledge" tab in the top header and upload your text or markdown documents. Floowsynk automatically chunks the content and computes vector embeddings (via Ollama or configured embedding provider). Then, in the Workflow Canvas, add a "RAG" node, select your collection, and pass a dynamic search query like {{ $input.question }} to retrieve the top matching context snippets.',
        tags: ['rag', 'vector', 'embeddings', 'ollama', 'knowledge base', 'ai']
    },
    {
        id: 'faq-diamond-join',
        category: 'Troubleshooting',
        question: 'What happens when multiple parallel branches connect into a single downstream node?',
        answer: 'Floowsynk features automatic diamond fan-in resolution (isJoinReady). When two or more parallel branches converge on a single downstream node, the engine waits until all active upstream parent branches have completed before executing the join node, preventing duplicate premature executions.',
        tags: ['dag', 'parallel', 'fan-in', 'join', 'branches', 'cycle']
    }
];
