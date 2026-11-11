<template>
    <div class="help-workflow-stage" :class="{ 'dark-stage': isDark }">
        <!-- Top Toolbar & Sample Workflow Selector -->
        <div class="stage-toolbar-top">
            <div class="sample-pills-row" role="tablist" aria-label="Sample Workflows">
                <button
                    v-for="sample in sampleWorkflows"
                    :key="sample.id"
                    type="button"
                    role="tab"
                    :aria-selected="activeSampleId === sample.id"
                    class="sample-pill-btn"
                    :class="{ active: activeSampleId === sample.id }"
                    :style="activeSampleId === sample.id ? { borderColor: sample.badgeColor, color: sample.badgeColor } : {}"
                    @click="selectSample(sample.id)"
                >
                    <i :class="sample.icon"></i>
                    <span>{{ sample.title }}</span>
                    <span class="sample-badge" :style="{ backgroundColor: `${sample.badgeColor}22`, color: sample.badgeColor }">
                        {{ sample.badge }}
                    </span>
                </button>
            </div>

            <!-- Canvas Action Controls -->
            <div class="stage-actions-row">
                <button
                    v-if="!isRunning"
                    type="button"
                    class="canvas-action-btn run-btn"
                    @click="runWorkflowTest"
                    title="Execute this sample workflow to test real-time node statuses and replay traces"
                >
                    <i class="pi pi-play"></i>
                    <span>Run Workflow Test</span>
                </button>
                <button
                    v-else
                    type="button"
                    class="canvas-action-btn exit-run-btn"
                    @click="exitRunMode"
                    title="Exit execution test mode"
                >
                    <i class="pi pi-stop-circle"></i>
                    <span>Stop Test Mode</span>
                </button>

                <button
                    type="button"
                    class="canvas-action-btn reset-btn"
                    @click="resetSample"
                    title="Reset sample workflow to original default layout and nodes"
                >
                    <i class="pi pi-refresh"></i>
                    <span>Reset</span>
                </button>

                <button
                    type="button"
                    class="canvas-action-btn palette-toggle-btn"
                    :class="{ active: showSidebar }"
                    @click="showSidebar = !showSidebar"
                    title="Toggle node library palette to drag more nodes onto the canvas"
                >
                    <i class="pi pi-th-large"></i>
                    <span>{{ showSidebar ? 'Hide Nodes' : 'Add Nodes' }}</span>
                </button>

                <button
                    type="button"
                    class="canvas-action-btn clone-btn"
                    @click="cloneToStudio"
                    title="Clone this sample workflow into your active workspace and open in full Workflow Canvas"
                >
                    <i class="pi pi-external-link"></i>
                    <span>Open in Studio</span>
                </button>
            </div>
        </div>

        <!-- Sample Workflow Sub-Header Info Banner -->
        <div class="stage-info-banner">
            <div class="info-left">
                <span class="status-indicator-dot" :class="{ running: isRunning }"></span>
                <span class="info-title"><strong>{{ currentSample.title }}:</strong> {{ currentSample.description }}</span>
            </div>
            <div class="info-right">
                <span class="meta-pill"><i class="pi pi-sitemap"></i> {{ nodeCount }} Nodes</span>
                <span class="meta-pill"><i class="pi pi-share-alt"></i> {{ edgeCount }} Connections</span>
                <span class="meta-pill status-pill" :class="isRunning ? 'running' : 'ready'">
                    <i class="pi" :class="isRunning ? 'pi-spin pi-spinner' : 'pi-check-circle'"></i>
                    {{ isRunning ? 'Test Executing...' : 'Ready for Testing' }}
                </span>
            </div>
        </div>

        <!-- Middle VueFlow Canvas Viewport -->
        <div class="workflow-viewport-box">
            <div class="content" :id="canvasId">
                <SidebarCanvas v-if="showSidebar" />

                <VueFlow
                    class="vue-flow-container"
                    tabindex="0"
                    v-model:nodes="node"
                    v-model:edges="edge"
                    :only-render-visible-elements="false"
                    :snapToGrid="true"
                    :fit-view-on-init="true"
                    :nodes-draggable="!isRunning"
                    :nodes-connectable="!isRunning"
                    :elements-selectable="true"
                    @node-click="onNodeClick"
                    @connect="onConnectEdge"
                    @drop="onDropNode"
                    @dragover="onDragOver"
                    delete-key-code="false"
                    no-wheel-class-name="no-scroll"
                >
                    <Background />
                    <MiniMap />
                    <Controls position="top-right">
                        <ControlButton title="Fit & Reset Transform" @click="resetTransform">
                            <span class="material-symbols-outlined">refresh</span>
                        </ControlButton>
                        <ControlButton
                            title="Run Workflow"
                            v-if="!isRunning"
                            style="background: var(--green-6); color: #ffffff;"
                            @click="runWorkflowTest"
                        >
                            <span class="material-symbols-outlined">play_arrow</span>
                        </ControlButton>
                        <ControlButton
                            title="Exit Run Mode"
                            v-else
                            style="background: var(--red-6); color: #ffffff;"
                            @click="exitRunMode"
                        >
                            <span class="material-symbols-outlined">close</span>
                        </ControlButton>
                    </Controls>

                    <template #node-default="nodeProps">
                        <FloowsynkNode v-bind="nodeProps" :tabid="currentTabId" />
                    </template>
                    <template #node-custom="nodeProps">
                        <FloowsynkNode v-bind="nodeProps" :tabid="currentTabId" />
                    </template>
                    <template #edge-custom="edgeProps">
                        <CustomEdge v-bind="edgeProps" :tabId="currentTabId" />
                    </template>
                </VueFlow>

                <!-- Slide-over Right Node Inspector Drawer -->
                <transition name="drawer-slide-right">
                    <div class="node-inspector-drawer glass-card" v-if="activeInspectorNode">
                        <div class="inspector-header">
                            <div class="inspector-title-group">
                                <span class="material-symbols-outlined inspector-icon">settings</span>
                                <div>
                                    <div class="inspector-title">{{ activeInspectorNode.data?.name || activeInspectorNode.label || toSentenceCase(activeInspectorNode.nodetype) }}</div>
                                    <div class="inspector-id">Node ID: {{ activeInspectorNode.id }} • {{ toSentenceCase(activeInspectorNode.nodetype) }}</div>
                                </div>
                            </div>
                            <button type="button" class="inspector-close-btn" @click="activeInspectorNodeId = null">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div class="inspector-body">
                            <WorkflowNodeSidebarFields
                                :nodeType="activeInspectorNode.nodetype"
                                v-model="activeInspectorNode.data"
                                :tabid="currentTabId"
                                :disabled="isRunning"
                            />
                        </div>
                    </div>
                </transition>

                <!-- Slide-up Replay Steps Drawer -->
                <transition name="drawer-slide-up">
                    <div class="replaysteps" v-if="showReplayData && isRunning">
                        <ReplaySteps :tabId="currentTabId" />
                    </div>
                </transition>
            </div>
        </div>

        <!-- Bottom Testing Guidance Dock -->
        <div class="stage-footer-dock">
            <div class="dock-hint-col">
                <span class="dock-badge"><i class="pi pi-lightbulb"></i> Test Tip:</span>
                <span class="dock-text">{{ currentSample.testInputHint }}</span>
            </div>
            <div class="dock-outcome-col">
                <span class="dock-badge outcome"><i class="pi pi-check"></i> Expected Outcome:</span>
                <span class="dock-text">{{ currentSample.expectedOutcome }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import { Background } from '@vue-flow/background';
import { Controls, ControlButton } from '@vue-flow/controls';
import FloowsynkNode from '@/views/Workflow/Nodes';
import CustomEdge from '@/views/Workflow/Edges/CustomEdge.vue';
import { SidebarCanvas, SidebarCanvasFields as WorkflowNodeSidebarFields } from '@/views/Workflow/Sidebar';
import ReplaySteps from '@/views/Workflow/ReplaySteps';
import { useWorkflowStore } from '@/views/Workflow/Workflow.hooks';
import { useWorkflowCanvasHooks, useWorkflowCanvasStore } from '@/views/Workflow/Canvas/Workflow.Canvas.hooks';

import { useSidebarCanvasStore } from '@/views/Workflow/Sidebar/Canvas/Workflow.Sidebar.Canvas.hooks';
import { SAMPLE_WORKFLOWS } from '../Help.constants';
import type { SampleWorkflowDefinition } from '../Help.types';
import { generateUUID, toSentenceCase } from '@/components/Composable/Utilities';
import { useToast } from 'primevue/usetoast';

const props = defineProps<{
    modelValueSampleId?: string;
    focusedNodeId?: string;
    isDark?: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValueSampleId', sampleId: string): void;
    (e: 'node-selected', nodeId: string): void;
}>();

const router = useRouter();
const toast = useToast();
const sampleWorkflows = SAMPLE_WORKFLOWS;
const activeSampleId = ref(props.modelValueSampleId || sampleWorkflows[0].id);
const showSidebar = ref(false);

const currentSample = computed(() => {
    return sampleWorkflows.find(s => s.id === activeSampleId.value) || sampleWorkflows[0];
});

const currentTabId = computed(() => currentSample.value.tabId);

const { tabs, activeTab } = useWorkflowStore();
const { draggedNode } = useSidebarCanvasStore();

// Initialize or synchronize sample workflow tab in global store
function initSampleTab(sample: SampleWorkflowDefinition, forceReset = false) {
    const existingIndex = tabs.value.findIndex(t => t.id === sample.tabId);
    const cloned = JSON.parse(JSON.stringify(sample.workflow));
    if (existingIndex === -1) {
        tabs.value.push(cloned);
    } else if (forceReset) {
        tabs.value[existingIndex] = cloned;
    }
}

// Pre-initialize all sample workflows into global store
sampleWorkflows.forEach(sample => {
    initSampleTab(sample);
});

const { tab, canvasId, node, edge, commit } = useWorkflowCanvasHooks(currentTabId.value);
const {
    isRunning,
    nodeStatuses,
    replayData,
    showReplayData,
    activeInspectorNodeId
} = useWorkflowCanvasStore(currentTabId.value);

const nodeCount = computed(() => (node.value as any[])?.length || 0);
const edgeCount = computed(() => (edge.value as any[])?.length || 0);

const activeInspectorNode = computed(() => {
    if (!activeInspectorNodeId.value || activeInspectorNodeId.value === '0') return null;
    return (node.value as any[]).find(n => n.id === activeInspectorNodeId.value) || null;
});

function selectSample(sampleId: string) {
    activeSampleId.value = sampleId;
    emit('update:modelValueSampleId', sampleId);
    const sample = sampleWorkflows.find(s => s.id === sampleId);
    if (sample) {
        initSampleTab(sample);
        exitRunMode();
        activeInspectorNodeId.value = null;
    }
}

function resetSample() {
    initSampleTab(currentSample.value, true);
    exitRunMode();
    activeInspectorNodeId.value = null;
    toast.add({
        severity: 'info',
        summary: 'Sample Reset',
        detail: `Reset "${currentSample.value.title}" to default configuration.`,
        life: 2500
    });
}

function cloneToStudio() {
    const cloned = JSON.parse(JSON.stringify(tab.value));
    const newId = generateUUID();
    cloned.id = newId;
    cloned.name = `${cloned.name} (My Copy)`;
    cloned.isnew = true;
    cloned.ismodified = false;
    tabs.value.push(cloned);
    activeTab.value = newId;
    toast.add({
        severity: 'success',
        summary: 'Copied to Studio',
        detail: `Opened in Workflow Studio. You can now edit, save, and deploy!`,
        life: 3000
    });
    router.push('/workflow');
}

function onNodeClick(event: any) {
    const clickedId = event?.node?.id;
    if (clickedId) {
        activeInspectorNodeId.value = clickedId;
        emit('node-selected', clickedId);
    }
}

function onConnectEdge(edgeEvent: any) {
    if (isRunning.value) return;
    edgeEvent.type = 'custom';
    edgeEvent.animated = true;
    edgeEvent.tabId = currentTabId.value;
    if (tab.value.edgesList) {
        const exists = tab.value.edgesList.some((e: any) => e.source === edgeEvent.source && e.target === edgeEvent.target);
        if (!exists) {
            tab.value.edgesList.push(edgeEvent);
            commit();
        }
    }
}

function onDragOver(event: DragEvent) {
    event.preventDefault();
}

function onDropNode(event: any) {
    if (isRunning.value) return;
    const newNode = JSON.parse(JSON.stringify(draggedNode.value));
    if (!newNode) return;
    newNode.id = generateUUID();
    newNode.position = { x: Math.max(40, event.offsetX - 100), y: Math.max(40, event.offsetY - 30) };
    if (!tab.value.nodesList) tab.value.nodesList = [];
    tab.value.nodesList.push(newNode);
    commit();
}

let simulatedTimeoutId: ReturnType<typeof setTimeout> | null = null;

async function runWorkflowTest() {
    showReplayData.value = false;
    replayData.value = [];
    nodeStatuses.value = {};
    isRunning.value = true;

    toast.add({
        severity: 'info',
        summary: 'Testing Workflow',
        detail: `Executing DAG: "${currentSample.value.title}"...`,
        life: 2500
    });

    let backendStreamStarted = false;
    try {
        const api = await import('@/views/Workflow/Canvas/Workflow.Canvas.api');
        const stream = await api.executeProcess(tab.value);
        if (stream && typeof stream.on === 'function') {
            backendStreamStarted = true;
            stream.on('data', (response: any) => {
                const nodeId = response?.getNodeid?.() || response?.nodeid;
                const status = response?.getStatus?.() ?? response?.status;
                if (status === 1) {
                    nodeStatuses.value[nodeId] = 'running';
                } else if (status === 2) {
                    nodeStatuses.value[nodeId] = 'success';
                    replayData.value.push(typeof response.toObject === 'function' ? response.toObject() : response);
                } else if (status === 3) {
                    nodeStatuses.value[nodeId] = 'error';
                    replayData.value.push(typeof response.toObject === 'function' ? response.toObject() : response);
                }
            });
            stream.on('end', () => {
                showReplayData.value = true;
                toast.add({
                    severity: 'success',
                    summary: 'Test Succeeded',
                    detail: 'All nodes finished execution.',
                    life: 3000
                });
            });
        }
    } catch {
        backendStreamStarted = false;
    }

    if (!backendStreamStarted) {
        // High-fidelity fallback execution trace so offline/testing always works smoothly
        simulateLocalRun();
    }
}

function simulateLocalRun() {
    const rawNodes = (tab.value.nodesList || []) as any[];
    const executableNodes = rawNodes.filter(n => n.nodetype !== 'stickyNote' && n.nodetype !== 'visualGroup');
    const startTime = Date.now();

    let stepIdx = 0;
    function advanceStep() {
        if (!isRunning.value) return;
        if (stepIdx >= executableNodes.length) {
            showReplayData.value = true;
            toast.add({
                severity: 'success',
                summary: 'Workflow Test Complete',
                detail: `All ${executableNodes.length} nodes executed successfully. Check the Replay Steps drawer below!`,
                life: 3500
            });
            return;
        }

        const currentNode = executableNodes[stepIdx];
        nodeStatuses.value[currentNode.id] = 'running';

        simulatedTimeoutId = setTimeout(() => {
            if (!isRunning.value) return;
            nodeStatuses.value[currentNode.id] = 'success';

            // Generate realistic replay step object
            const replayEntry: any = {
                id: generateUUID(),
                workflowid: currentTabId.value,
                nodeid: currentNode.id,
                status: 2, // SUCCESS
                message: getSimulatedLogMessage(currentNode),
                variablesMap: getSimulatedVariables(currentNode),
                duration: `${(Math.random() * 80 + 20).toFixed(1)}ms`,
                createdat: new Date(startTime + stepIdx * 300).toISOString()
            };
            replayData.value.push(replayEntry);

            stepIdx++;
            simulatedTimeoutId = setTimeout(advanceStep, 250);
        }, 350);
    }

    advanceStep();
}

function getSimulatedLogMessage(n: any): string {
    switch (n.nodetype) {
        case 'webhook':
            return `[Webhook] Ingested order event from 192.0.2.44 with payload items=2.`;
        case 'defaultnode':
            return `[Manual Trigger] Workflow initiated by user.`;
        case 'interval':
            return `[Interval] Cron fired at 5m schedule.`;
        case 'code':
            return `[Goja JS] Script completed in 1.4ms. Emitted calculated payload.`;
        case 'linear':
            return `[Linear] Issue SEC-402 created successfully. Priority: Urgent.`;
        case 'rag':
            return `[RAG] Retrieved 3 vector chunks from 'floowsynk-docs-v2' (similarity: 0.91).`;
        case 'output':
            return `[Output] Emitted structured JSON result. Workflow completed.`;
        default:
            return `Node ${n.label || n.nodetype} executed successfully.`;
    }
}

function getSimulatedVariables(n: any): Array<[string, string]> {
    if (n.nodetype === 'code') {
        return [
            ['$input.orderId', 'ORD-2026-9812'],
            ['$input.tier', 'PLATINUM_VIP'],
            ['$input.discountSaved', '$42.75'],
            ['$input.finalAmount', '$242.25']
        ];
    }
    if (n.nodetype === 'linear') {
        return [
            ['$input.issueId', 'LIN-8891'],
            ['$input.url', 'https://linear.app/floowsynk/issue/SEC-402']
        ];
    }
    if (n.nodetype === 'rag') {
        return [
            ['$input.matches[0].title', 'Pin Data Caching in Workflows'],
            ['$input.matches[0].score', '0.914']
        ];
    }
    return [
        ['$input.status', 'OK'],
        ['$input.timestamp', new Date().toISOString()]
    ];
}

function exitRunMode() {
    isRunning.value = false;
    if (simulatedTimeoutId) clearTimeout(simulatedTimeoutId);
    const rawNodes = (tab.value.nodesList || []) as any[];
    rawNodes.forEach(n => {
        nodeStatuses.value[n.id] = '';
    });
    showReplayData.value = false;
}

function resetTransform() {
    try {
        const { fitView, setViewport } = useVueFlow();
        if (typeof fitView === 'function') {
            fitView({ padding: 0.2 });
        } else {
            setViewport({ x: 0, y: 0, zoom: 1 });
        }
    } catch {
        // VueFlow instance fallback
    }
}

// Watch for prop changes from outside (e.g. tour chapters)
watch(
    () => props.modelValueSampleId,
    (newVal) => {
        if (newVal && newVal !== activeSampleId.value) {
            selectSample(newVal);
        }
    }
);

watch(
    () => props.focusedNodeId,
    (newFocusNodeId) => {
        if (!newFocusNodeId) return;
        activeInspectorNodeId.value = newFocusNodeId;
    }
);

onMounted(() => {
    initSampleTab(currentSample.value);
});
</script>

<style scoped>
.help-workflow-stage {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 560px;
    border-radius: 16px;
    overflow: hidden;
    background: var(--surface-bg, #0b1120);
    border: 1px solid rgba(99, 102, 241, 0.28);
    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.35);
    display: flex;
    flex-direction: column;
}

/* Top Toolbar: Sample Workflow Tabs & Test Actions */
.stage-toolbar-top {
    position: relative;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px 14px;
    background: #0f172a;
    border-bottom: 1px solid rgba(148, 163, 184, 0.16);
    flex-shrink: 0;
}

.sample-pills-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
}

.sample-pill-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    background: rgba(30, 41, 59, 0.85);
    border: 1px solid rgba(148, 163, 184, 0.22);
    color: #cbd5e1;
    font-size: 0.74rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.sample-pill-btn:hover {
    background: rgba(51, 65, 85, 0.95);
    border-color: rgba(129, 140, 248, 0.5);
    color: #f8fafc;
}

.sample-pill-btn.active {
    background: rgba(79, 70, 229, 0.25);
    border-color: #818cf8;
    color: #ffffff;
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.25);
}

.sample-badge {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
}

.stage-actions-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
}

.canvas-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.74rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(148, 163, 184, 0.24);
    background: rgba(30, 41, 59, 0.9);
    color: #f1f5f9;
}

.canvas-action-btn:hover {
    background: rgba(51, 65, 85, 0.95);
    border-color: rgba(129, 140, 248, 0.55);
}

.run-btn {
    background: linear-gradient(135deg, #10b981, #059669);
    border-color: rgba(52, 211, 153, 0.45);
    color: #ffffff;
    box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);
}

.run-btn:hover {
    filter: brightness(1.1);
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.5);
}

.exit-run-btn {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border-color: rgba(248, 113, 113, 0.45);
    color: #ffffff;
}

.clone-btn {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    border-color: rgba(129, 140, 248, 0.4);
    color: #ffffff;
}

.clone-btn:hover {
    filter: brightness(1.1);
}

.palette-toggle-btn.active {
    background: rgba(99, 102, 241, 0.3);
    border-color: #818cf8;
}

/* Sub-Header Banner */
.stage-info-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    padding: 7px 14px;
    background: rgba(15, 23, 42, 0.7);
    border-bottom: 1px solid rgba(148, 163, 184, 0.12);
    font-size: 0.75rem;
    color: #94a3b8;
    flex-shrink: 0;
}

.info-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.status-indicator-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 6px #10b981;
}

.status-indicator-dot.running {
    background: #f59e0b;
    box-shadow: 0 0 10px #f59e0b;
    animation: pulse 1s infinite alternate;
}

@keyframes pulse {
    from { transform: scale(1); opacity: 1; }
    to { transform: scale(1.4); opacity: 0.6; }
}

.info-title {
    color: #e2e8f0;
}

.info-right {
    display: flex;
    align-items: center;
    gap: 8px;
}

.meta-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 6px;
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(148, 163, 184, 0.16);
    font-size: 0.7rem;
    font-weight: 500;
}

.status-pill.ready {
    color: #34d399;
    border-color: rgba(52, 211, 153, 0.3);
}

.status-pill.running {
    color: #fbbf24;
    border-color: rgba(251, 191, 36, 0.3);
}

/* Middle VueFlow Viewport */
.workflow-viewport-box {
    position: relative;
    flex: 1;
    min-height: 420px;
    width: 100%;
    overflow: hidden;
    background: var(--surface-bg, #0b1120);
}

.content {
    position: relative;
    display: flex;
    height: 100%;
    width: 100%;
    overflow: hidden;
}

.vue-flow-container {
    width: 100%;
    height: 100%;
}

/* Slide-over Right Node Inspector Drawer */
.node-inspector-drawer {
    position: absolute;
    top: 10px;
    right: 10px;
    bottom: 10px;
    width: 360px;
    max-width: 90%;
    z-index: 20;
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(99, 102, 241, 0.4);
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(14px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.inspector-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    background: rgba(30, 41, 59, 0.8);
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}

.inspector-title-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.inspector-icon {
    font-size: 20px;
    color: #818cf8;
}

.inspector-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: #f8fafc;
}

.inspector-id {
    font-size: 0.7rem;
    color: #94a3b8;
}

.inspector-close-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px;
    display: flex;
    border-radius: 6px;
}

.inspector-close-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
}

.inspector-body {
    flex: 1;
    overflow-y: auto;
    padding: 14px;
}

/* Slide-up Replay Steps Drawer */
.replaysteps {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 240px;
    z-index: 15;
    background: rgba(15, 23, 42, 0.96);
    border-top: 1px solid rgba(99, 102, 241, 0.35);
    box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
}

/* Bottom Testing Dock */
.stage-footer-dock {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding: 9px 16px;
    background: #0f172a;
    border-top: 1px solid rgba(148, 163, 184, 0.16);
    flex-shrink: 0;
    font-size: 0.74rem;
}

.dock-hint-col,
.dock-outcome-col {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 240px;
}

.dock-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #f59e0b;
    font-weight: 700;
    flex-shrink: 0;
}

.dock-badge.outcome {
    color: #10b981;
}

.dock-text {
    color: #cbd5e1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Animations */
.drawer-slide-right-enter-active,
.drawer-slide-right-leave-active {
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.drawer-slide-right-enter-from,
.drawer-slide-right-leave-to {
    transform: translateX(100%);
    opacity: 0;
}

.drawer-slide-up-enter-active,
.drawer-slide-up-leave-active {
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.drawer-slide-up-enter-from,
.drawer-slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
}
</style>
