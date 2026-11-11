<template>
    <div class="help-page-container" ref="pageContainerRef">
        <!-- Hero Header Banner (Modern & Cohesive) -->
        <header class="help-hero-banner">
            <div class="hero-left-col">
                <div class="hero-badge-row">
                    <span class="hero-pill-badge">
                        <i class="pi pi-compass"></i> Interactive Guide &amp; Live Workflow Studio
                    </span>
                    <span class="hero-shortcut-hint">
                        Press <kbd>?</kbd> for Help • Select any sample workflow to test live on canvas
                    </span>
                </div>

                <h1 class="hero-title">Master Floowsynk Workflow Orchestration</h1>
                <p class="hero-subtitle">
                    Learn, inspect, and test actual Floowsynk workflows right in the canvas. Experiment with real triggers, Goja JavaScript, enterprise connectors, and pin data.
                </p>
            </div>

            <div class="hero-right-actions">
                <div class="section-jump-pills">
                    <button
                        type="button"
                        class="jump-pill-btn"
                        :class="{ active: activeSection === 'tour' }"
                        @click="selectSection('tour')"
                    >
                        <i class="pi pi-compass"></i>
                        <span>Live Studio</span>
                    </button>
                    <button
                        type="button"
                        class="jump-pill-btn"
                        :class="{ active: activeSection === 'samples' }"
                        @click="selectSection('samples')"
                    >
                        <i class="pi pi-th-large"></i>
                        <span>Sample Library</span>
                    </button>
                    <button
                        type="button"
                        class="jump-pill-btn"
                        :class="{ active: activeSection === 'catalog' }"
                        @click="selectSection('catalog')"
                    >
                        <i class="pi pi-sitemap"></i>
                        <span>Node Catalog</span>
                    </button>
                    <button
                        type="button"
                        class="jump-pill-btn"
                        :class="{ active: activeSection === 'faq' }"
                        @click="selectSection('faq')"
                    >
                        <i class="pi pi-question-circle"></i>
                        <span>FAQ &amp; Docs</span>
                    </button>
                </div>

                <div class="quick-launch-row">
                    <router-link to="/workflow" class="launch-app-btn">
                        <i class="pi pi-plus-circle"></i>
                        <span>Open Workflow Studio</span>
                    </router-link>
                    <router-link to="/connectors" class="jump-pill-btn">
                        <i class="pi pi-box"></i>
                        <span>Connectors Hub</span>
                    </router-link>
                    <router-link to="/rag" class="jump-pill-btn">
                        <i class="pi pi-bolt"></i>
                        <span>RAG Knowledge</span>
                    </router-link>
                </div>
            </div>
        </header>

        <!-- Main Section Navigation Tabs -->
        <nav class="help-section-nav" role="tablist" aria-label="Help Navigation Sections">
            <button
                type="button"
                role="tab"
                :aria-selected="activeSection === 'tour'"
                class="nav-tab-btn"
                :class="{ active: activeSection === 'tour' }"
                @click="selectSection('tour')"
            >
                <i class="pi pi-compass"></i>
                <span class="nav-tab-title">Interactive Studio &amp; Tour</span>
                <span class="nav-tab-badge">7 Chapters • Live Canvas</span>
            </button>

            <button
                type="button"
                role="tab"
                :aria-selected="activeSection === 'samples'"
                class="nav-tab-btn"
                :class="{ active: activeSection === 'samples' }"
                @click="selectSection('samples')"
            >
                <i class="pi pi-th-large"></i>
                <span class="nav-tab-title">Sample Workflows</span>
                <span class="nav-tab-badge">4 Templates</span>
            </button>

            <button
                type="button"
                role="tab"
                :aria-selected="activeSection === 'catalog'"
                class="nav-tab-btn"
                :class="{ active: activeSection === 'catalog' }"
                @click="selectSection('catalog')"
            >
                <i class="pi pi-sitemap"></i>
                <span class="nav-tab-title">Node Catalog</span>
                <span class="nav-tab-badge">20+ Nodes</span>
            </button>

            <button
                type="button"
                role="tab"
                :aria-selected="activeSection === 'faq'"
                class="nav-tab-btn"
                :class="{ active: activeSection === 'faq' }"
                @click="selectSection('faq')"
            >
                <i class="pi pi-question-circle"></i>
                <span class="nav-tab-title">FAQ &amp; Docs</span>
                <span class="nav-tab-badge">15 Answers</span>
            </button>

            <button
                type="button"
                role="tab"
                :aria-selected="activeSection === 'all'"
                class="nav-tab-btn view-all-btn"
                :class="{ active: activeSection === 'all' }"
                @click="selectSection('all')"
                title="View all sections together on one page"
            >
                <i class="pi pi-list"></i>
                <span class="nav-tab-title">View All</span>
            </button>
        </nav>

        <!-- SECTION 1: GUIDED STUDIO & LIVE SAMPLE WORKFLOW CANVAS -->
        <div v-show="activeSection === 'tour' || activeSection === 'all'" class="section-container">
            <!-- 3 Quick Start Core Concepts Cards -->
            <div class="quick-overview-grid">
                <div class="quick-card">
                    <div class="quick-card-icon" style="background: rgba(99, 102, 241, 0.15); color: #6366f1;">
                        <i class="pi pi-sitemap"></i>
                    </div>
                    <div class="quick-card-content">
                        <span class="quick-step-num">Step 1</span>
                        <h3 class="quick-card-title">Real Visual Canvas</h3>
                        <p class="quick-card-desc">Drag triggers, connectors, and logic nodes. Connect handles to orchestrate parallel or sequential DAG execution paths.</p>
                    </div>
                </div>

                <div class="quick-card">
                    <div class="quick-card-icon" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">
                        <i class="pi pi-code"></i>
                    </div>
                    <div class="quick-card-content">
                        <span class="quick-step-num">Step 2</span>
                        <h3 class="quick-card-title">Goja JavaScript &amp; Pills</h3>
                        <p class="quick-card-desc">Access parent node data effortlessly using <code>&#123;&#123; $input.field &#125;&#125;</code> expressions or transform payloads in the Goja JS sandbox.</p>
                    </div>
                </div>

                <div class="quick-card">
                    <div class="quick-card-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
                        <i class="pi pi-bookmark"></i>
                    </div>
                    <div class="quick-card-content">
                        <span class="quick-step-num">Step 3</span>
                        <h3 class="quick-card-title">Pin Data &amp; Replay Logs</h3>
                        <p class="quick-card-desc">Freeze real test outputs in the node inspector. Iterate and test downstream nodes instantly with full replay step inspection.</p>
                    </div>
                </div>
            </div>

            <!-- Studio Toolbar: Layout Controls & Active Chapter Info -->
            <div class="studio-toolbar-bar">
                <div class="studio-toolbar-left">
                    <i class="pi pi-info-circle text-primary"></i>
                    <span>Chapter {{ activeStepIndex + 1 }} of {{ TOUR_STEPS.length }}: <strong>{{ TOUR_STEPS[activeStepIndex]?.title }}</strong></span>
                </div>
                <div class="studio-toolbar-right">
                    <button
                        type="button"
                        class="toggle-layout-btn"
                        :class="{ active: canvasFocusMode }"
                        @click="canvasFocusMode = !canvasFocusMode"
                        :title="canvasFocusMode ? 'Show side-by-side guided walkthrough' : 'Expand canvas to full width for hands-on testing'"
                    >
                        <i class="pi" :class="canvasFocusMode ? 'pi-window-minimize' : 'pi-window-maximize'"></i>
                        <span>{{ canvasFocusMode ? 'Show Walkthrough Guide' : 'Full-Width Canvas Mode' }}</span>
                    </button>
                </div>
            </div>

            <!-- Split-Screen Interactive Studio (Guided Stepper + Actual Floowsynk Canvas) -->
            <section id="studio-section" class="split-studio-grid" :class="{ 'focus-mode': canvasFocusMode }">
                <div v-show="!canvasFocusMode" class="studio-col-tour">
                    <InteractiveTour
                        v-model:activeStepIndex="activeStepIndex"
                        @select-sample="onSelectSampleFromTour"
                        @focus-node="onFocusNodeFromTour"
                        @run-test="onRunTestFromTour"
                    />
                </div>

                <div class="studio-col-canvas">
                    <HelpWorkflowCanvas
                        :key="selectedSampleId"
                        ref="canvasRef"
                        v-model:modelValueSampleId="selectedSampleId"
                        :focusedNodeId="focusedNodeId"
                        :isDark="isDark"
                        @node-selected="onCanvasNodeSelected"
                    />
                </div>
            </section>
        </div>

        <!-- SECTION 2: SAMPLE WORKFLOWS LIBRARY -->
        <div v-show="activeSection === 'samples' || activeSection === 'all'" id="samples-section" class="section-container">
            <div class="section-header-block">
                <span class="section-eyebrow">
                    <i class="pi pi-th-large"></i> Production Ready Templates
                </span>
                <h2 class="section-heading">Curated Sample Workflows for Testing</h2>
                <p class="section-subheading">
                    Explore real-world workflow patterns ready for instant testing. Select any sample to launch it directly into the live canvas above, or clone it into your workspace.
                </p>
            </div>

            <div class="sample-library-grid">
                <div
                    v-for="sample in SAMPLE_WORKFLOWS"
                    :key="sample.id"
                    class="sample-library-card"
                    :class="{ active: selectedSampleId === sample.id }"
                >
                    <div class="sample-card-header">
                        <div class="sample-card-icon" :style="{ backgroundColor: `${sample.badgeColor}20`, color: sample.badgeColor }">
                            <i :class="sample.icon"></i>
                        </div>
                        <div class="sample-card-meta">
                            <span class="sample-card-badge" :style="{ backgroundColor: `${sample.badgeColor}18`, color: sample.badgeColor }">
                                {{ sample.badge }}
                            </span>
                            <span class="sample-card-cat">{{ sample.category }}</span>
                        </div>
                    </div>

                    <h3 class="sample-card-title">{{ sample.title }}</h3>
                    <p class="sample-card-desc">{{ sample.description }}</p>

                    <div class="sample-nodes-strip">
                        <span class="strip-label"><i class="pi pi-sitemap"></i> Nodes:</span>
                        <div class="strip-chips">
                            <span v-for="node in sample.keyNodes" :key="node" class="node-chip">
                                {{ node }}
                            </span>
                        </div>
                    </div>

                    <div class="sample-outcome-box">
                        <strong>Expected Outcome:</strong> {{ sample.expectedOutcome }}
                    </div>

                    <div class="sample-card-actions">
                        <button
                            type="button"
                            class="sample-btn primary"
                            @click="loadSampleInStudio(sample.id)"
                        >
                            <i class="pi pi-play"></i>
                            <span>Test on Live Canvas</span>
                        </button>

                        <button
                            type="button"
                            class="sample-btn secondary"
                            @click="cloneSampleToStudio(sample)"
                        >
                            <i class="pi pi-external-link"></i>
                            <span>Clone to Studio</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- SECTION 3: NODE CATALOG & CONTRACTS -->
        <div v-show="activeSection === 'catalog' || activeSection === 'all'" class="section-container">
            <NodeCatalogBrowser />
        </div>

        <!-- SECTION 4: FAQ & TROUBLESHOOTING -->
        <div v-show="activeSection === 'faq' || activeSection === 'all'" class="section-container">
            <FaqSection />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/components/Composable/UI/composables/useTheme';
import { TOUR_STEPS, SAMPLE_WORKFLOWS } from './Help.constants';
import type { HelpSection, SampleWorkflowDefinition } from './Help.types';
import InteractiveTour from './components/InteractiveTour.vue';
import HelpWorkflowCanvas from './components/HelpWorkflowCanvas.vue';
import NodeCatalogBrowser from './components/NodeCatalogBrowser.vue';
import FaqSection from './components/FaqSection.vue';
import { useWorkflowStore } from '@/views/Workflow/Workflow.hooks';
import { generateUUID } from '@/components/Composable/Utilities';
import { useToast } from 'primevue/usetoast';

const { isDark } = useTheme();
const router = useRouter();
const toast = useToast();
const { tabs, activeTab } = useWorkflowStore();

const activeSection = ref<HelpSection>('tour');
const canvasFocusMode = ref(false);
const activeStepIndex = ref(0);
const selectedSampleId = ref(SAMPLE_WORKFLOWS[0].id);
const focusedNodeId = ref<string | undefined>(undefined);
const canvasRef = ref<any>(null);
const pageContainerRef = ref<HTMLElement | null>(null);

function selectSection(section: HelpSection) {
    activeSection.value = section;
    const selectorMap: Record<HelpSection, string> = {
        tour: '#studio-section',
        samples: '#samples-section',
        catalog: '#catalog-section',
        faq: '#faq-section',
        all: '.help-page-container'
    };
    if (section === 'all') {
        scrollToSection('.help-page-container');
    } else {
        setTimeout(() => {
            scrollToSection(selectorMap[section]);
        }, 50);
    }
}

function onSelectSampleFromTour(sampleId: string) {
    selectedSampleId.value = sampleId;
}

function onFocusNodeFromTour(nodeId: string) {
    focusedNodeId.value = nodeId;
}

function onRunTestFromTour() {
    if (canvasRef.value && typeof canvasRef.value.runWorkflowTest === 'function') {
        canvasRef.value.runWorkflowTest();
    }
}

function onCanvasNodeSelected(nodeId: string) {
    focusedNodeId.value = nodeId;
}

function loadSampleInStudio(sampleId: string) {
    selectedSampleId.value = sampleId;
    activeSection.value = 'tour';
    setTimeout(() => {
        scrollToSection('#studio-section');
    }, 50);
}

function cloneSampleToStudio(sample: SampleWorkflowDefinition) {
    const cloned = JSON.parse(JSON.stringify(sample.workflow));
    const newId = generateUUID();
    cloned.id = newId;
    cloned.name = `${cloned.name} (Copy)`;
    cloned.isnew = true;
    cloned.ismodified = false;
    tabs.value.push(cloned);
    activeTab.value = newId;
    toast.add({
        severity: 'success',
        summary: 'Cloned to Studio',
        detail: `Opened "${cloned.name}" in your active workflows.`,
        life: 3000
    });
    router.push('/workflow');
}

function scrollToSection(selector: string) {
    const el = document.querySelector(selector);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function handleKeydown(e: KeyboardEvent) {
    const target = e.target as HTMLElement | null;
    if (
        target &&
        (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable)
    ) {
        return;
    }

    if (e.key === 'ArrowRight') {
        activeStepIndex.value = (activeStepIndex.value + 1) % TOUR_STEPS.length;
    } else if (e.key === 'ArrowLeft') {
        activeStepIndex.value =
            (activeStepIndex.value - 1 + TOUR_STEPS.length) % TOUR_STEPS.length;
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);

    // Sync with hash if present
    const hash = window.location.hash;
    if (hash.includes('samples')) {
        activeSection.value = 'samples';
    } else if (hash.includes('catalog')) {
        activeSection.value = 'catalog';
    } else if (hash.includes('faq')) {
        activeSection.value = 'faq';
    } else if (hash.includes('studio') || hash.includes('tour')) {
        activeSection.value = 'tour';
    }
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped src="./Help.styles.css"></style>
