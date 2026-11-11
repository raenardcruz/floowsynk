export type TourSpeed = 'slow' | 'normal' | 'fast';
export type HelpSection = 'tour' | 'samples' | 'catalog' | 'faq' | 'all';

export interface SampleWorkflowDefinition {
    id: string;
    tabId: string;
    title: string;
    badge: string;
    badgeColor: string;
    category: string;
    icon: string;
    description: string;
    workflow: any;
    testInputHint: string;
    expectedOutcome: string;
    keyNodes: string[];
}

export interface TourStep {
    id: string;
    stepNumber: number;
    shortTitle: string;
    title: string;
    badge: string;
    badgeColor: string;
    icon: string;
    summary: string;
    highlights: {
        title: string;
        description: string;
        icon: string;
    }[];
    proTip: string;
    codeSnippet?: {
        title: string;
        language: string;
        code: string;
    };
    actionLink?: {
        label: string;
        to: string;
        icon: string;
    };
    targetSampleId: string;
    focusNodeId?: string;
}

export interface SandboxScriptPreset {
    id: string;
    name: string;
    description: string;
    inputJson: string;
    code: string;
}

export interface NodeCatalogEntry {
    nodetype: string;
    label: string;
    category: 'Triggers & Input' | 'Logic & Control' | 'Data Transformation' | 'Custom Scripting' | 'Connectivity' | 'AI & Vector' | 'Canvas & Notes' | 'Output';
    icon: string;
    accentColor: string;
    description: string;
    inputs: string[];
    outputs: string[];
    sampleUse: string;
    examplePayload: string;
}

export interface FaqEntry {
    id: string;
    category: 'Architecture' | 'Workflow Canvas' | 'Scripting & Variables' | 'Connectors & Auth' | 'RAG & AI' | 'MCP Agent Protocol' | 'Troubleshooting';
    question: string;
    answer: string;
    tags: string[];
}
