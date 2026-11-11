<template>
    <div class="tour-card">
        <!-- Top Chapter Scrubber & Playback Bar -->
        <div class="tour-playback-bar">
            <div class="chapter-pills-row" role="tablist" aria-label="Walkthrough Chapters">
                <button
                    v-for="(step, idx) in steps"
                    :key="step.id"
                    type="button"
                    role="tab"
                    :aria-selected="idx === activeStepIndex"
                    class="chapter-pill"
                    :class="{
                        active: idx === activeStepIndex,
                        completed: idx < activeStepIndex
                    }"
                    :style="idx === activeStepIndex ? { borderColor: step.badgeColor, color: step.badgeColor } : {}"
                    @click="selectStep(idx)"
                >
                    <span
                        class="chapter-num"
                        :style="idx === activeStepIndex ? { backgroundColor: step.badgeColor, color: '#fff' } : {}"
                    >
                        {{ step.stepNumber }}
                    </span>
                    <span class="chapter-short">{{ step.shortTitle }}</span>
                </button>
            </div>

            <div class="autoplay-controls">
                <button
                    type="button"
                    class="autoplay-btn"
                    :class="{ playing: isAutoPlaying }"
                    @click="toggleAutoPlay"
                    :title="isAutoPlaying ? 'Pause automatic walkthrough' : 'Start automatic guided walkthrough'"
                >
                    <i class="pi" :class="isAutoPlaying ? 'pi-pause' : 'pi-play'"></i>
                    <span>{{ isAutoPlaying ? 'Pause Tour' : 'Auto-Walkthrough' }}</span>
                </button>

                <div class="speed-selector" title="Walkthrough Pacing Speed">
                    <button
                        v-for="spd in (['slow', 'normal', 'fast'] as TourSpeed[])"
                        :key="spd"
                        type="button"
                        class="speed-chip"
                        :class="{ active: speed === spd }"
                        @click="setSpeed(spd)"
                    >
                        {{ spd === 'slow' ? 'Slow (10s)' : spd === 'normal' ? 'Normal (6s)' : 'Fast (3s)' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Auto-Play Smooth Progress Bar -->
        <div class="tour-progress-track">
            <div
                class="tour-progress-fill"
                :style="{
                    width: isAutoPlaying ? `${autoPlayProgress}%` : `${((activeStepIndex + 1) / steps.length) * 100}%`,
                    backgroundColor: currentStep.badgeColor
                }"
            ></div>
        </div>

        <!-- Active Step Educational Content -->
        <transition name="step-slide" mode="out-in">
            <div :key="currentStep.id" class="tour-step-body">
                <div class="step-meta-row">
                    <span
                        class="step-category-badge"
                        :style="{ backgroundColor: `${currentStep.badgeColor}18`, color: currentStep.badgeColor, borderColor: `${currentStep.badgeColor}40` }"
                    >
                        {{ currentStep.badge }}
                    </span>
                    <span class="step-counter-label">
                        Chapter {{ currentStep.stepNumber }} of {{ steps.length }}
                    </span>
                </div>

                <h2 class="step-main-title">{{ currentStep.title }}</h2>
                <p class="step-summary-text">{{ currentStep.summary }}</p>

                <!-- 3 Key Concept Highlights -->
                <div class="highlights-grid">
                    <div
                        v-for="(hl, hIdx) in currentStep.highlights"
                        :key="hIdx"
                        class="highlight-item-card"
                    >
                        <div class="hl-icon-box" :style="{ color: currentStep.badgeColor, backgroundColor: `${currentStep.badgeColor}15` }">
                            <i :class="hl.icon"></i>
                        </div>
                        <div class="hl-text-col">
                            <h4 class="hl-title">{{ hl.title }}</h4>
                            <p class="hl-desc">{{ hl.description }}</p>
                        </div>
                    </div>
                </div>

                <!-- Code / Architecture Diagram Snippet -->
                <div v-if="currentStep.codeSnippet" class="step-code-block">
                    <div class="code-block-header">
                        <span class="code-block-title">
                            <i class="pi pi-terminal"></i>
                            {{ currentStep.codeSnippet.title }}
                        </span>
                        <button type="button" class="copy-code-btn" @click="copyCode(currentStep.codeSnippet.code)">
                            <i class="pi" :class="copied ? 'pi-check' : 'pi-copy'"></i>
                            <span>{{ copied ? 'Copied' : 'Copy' }}</span>
                        </button>
                    </div>
                    <pre class="code-block-pre"><code>{{ currentStep.codeSnippet.code }}</code></pre>
                </div>

                <!-- Educational Pro-Tip Callout -->
                <div class="pro-tip-banner">
                    <div class="pro-tip-icon">
                        <i class="pi pi-lightbulb"></i>
                    </div>
                    <div class="pro-tip-content">
                        <strong>Pro Tip:</strong> {{ currentStep.proTip }}
                    </div>
                </div>
            </div>
        </transition>

        <!-- Stepper Footer Controls -->
        <div class="tour-footer-bar">
            <button
                type="button"
                class="nav-step-btn prev"
                :disabled="activeStepIndex === 0"
                @click="prevStep"
            >
                <i class="pi pi-arrow-left"></i>
                <span>Previous</span>
            </button>

            <div class="tour-footer-actions">
                <button
                    v-if="currentStep.targetSampleId"
                    type="button"
                    class="sample-jump-btn"
                    @click="onSelectSample"
                    title="Load the matching sample workflow on the live canvas"
                >
                    <i class="pi pi-sitemap"></i>
                    <span>Load Sample on Canvas</span>
                </button>

                <button
                    v-if="currentStep.focusNodeId"
                    type="button"
                    class="focus-node-btn"
                    @click="onFocusNode"
                    title="Focus and highlight this node on the live canvas"
                >
                    <i class="pi pi-search"></i>
                    <span>Inspect Node</span>
                </button>

                <button
                    type="button"
                    class="run-test-pill-btn"
                    @click="emit('run-test')"
                    title="Run live workflow test on the canvas"
                >
                    <i class="pi pi-play"></i>
                    <span>Run Test</span>
                </button>
            </div>

            <button
                type="button"
                class="nav-step-btn next"
                :style="{ backgroundColor: currentStep.badgeColor }"
                @click="nextStep"
            >
                <span>{{ activeStepIndex === steps.length - 1 ? 'Restart Tour' : 'Next Chapter' }}</span>
                <i class="pi" :class="activeStepIndex === steps.length - 1 ? 'pi-refresh' : 'pi-arrow-right'"></i>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';
import { TOUR_STEPS, TOUR_SPEED_MS } from '../Help.constants';
import type { TourSpeed } from '../Help.types';

const props = defineProps<{
    activeStepIndex: number;
}>();

const emit = defineEmits<{
    (e: 'update:activeStepIndex', index: number): void;
    (e: 'select-sample', sampleId: string): void;
    (e: 'focus-node', nodeId: string): void;
    (e: 'run-test'): void;
}>();

const steps = TOUR_STEPS;
const isAutoPlaying = ref(false);
const speed = ref<TourSpeed>('normal');
const autoPlayProgress = ref(0);
const copied = ref(false);

let timerIntervalId: ReturnType<typeof setInterval> | null = null;
const TICK_MS = 60;

const currentStep = computed(() => steps[props.activeStepIndex] || steps[0]);

function selectStep(idx: number) {
    emit('update:activeStepIndex', idx);
    autoPlayProgress.value = 0;
    syncWithCanvas(steps[idx]);
}

function nextStep() {
    const nextIdx = (props.activeStepIndex + 1) % steps.length;
    emit('update:activeStepIndex', nextIdx);
    autoPlayProgress.value = 0;
    syncWithCanvas(steps[nextIdx]);
}

function prevStep() {
    if (props.activeStepIndex > 0) {
        const prevIdx = props.activeStepIndex - 1;
        emit('update:activeStepIndex', prevIdx);
        autoPlayProgress.value = 0;
        syncWithCanvas(steps[prevIdx]);
    }
}

function syncWithCanvas(step: typeof steps[0]) {
    if (step.targetSampleId) {
        emit('select-sample', step.targetSampleId);
    }
    if (step.focusNodeId) {
        emit('focus-node', step.focusNodeId);
    }
}

function onSelectSample() {
    if (currentStep.value.targetSampleId) {
        emit('select-sample', currentStep.value.targetSampleId);
    }
}

function onFocusNode() {
    if (currentStep.value.targetSampleId) {
        emit('select-sample', currentStep.value.targetSampleId);
    }
    if (currentStep.value.focusNodeId) {
        emit('focus-node', currentStep.value.focusNodeId);
    }
}

function startAutoPlayTimer() {
    stopAutoPlayTimer();
    autoPlayProgress.value = 0;
    timerIntervalId = setInterval(() => {
        const duration = TOUR_SPEED_MS[speed.value];
        const increment = (TICK_MS / duration) * 100;
        autoPlayProgress.value += increment;
        if (autoPlayProgress.value >= 100) {
            autoPlayProgress.value = 0;
            nextStep();
        }
    }, TICK_MS);
}

function stopAutoPlayTimer() {
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
}

function toggleAutoPlay() {
    isAutoPlaying.value = !isAutoPlaying.value;
    if (isAutoPlaying.value) {
        startAutoPlayTimer();
    } else {
        stopAutoPlayTimer();
    }
}

function setSpeed(spd: TourSpeed) {
    speed.value = spd;
    if (isAutoPlaying.value) {
        startAutoPlayTimer();
    }
}

function copyCode(text: string) {
    navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => {
        copied.value = false;
    }, 2000);
}

onBeforeUnmount(() => {
    stopAutoPlayTimer();
});
</script>

<style scoped>
.tour-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 560px;
    background: #0f172a;
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.16);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    overflow: hidden;
}

/* Playback bar */
.tour-playback-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 14px;
    background: #0b1120;
    border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.chapter-pills-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
}

.chapter-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 6px;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(148, 163, 184, 0.2);
    color: #94a3b8;
    font-size: 0.72rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
}

.chapter-pill:hover {
    color: #f1f5f9;
    border-color: rgba(129, 140, 248, 0.4);
}

.chapter-pill.active {
    background: rgba(99, 102, 241, 0.16);
}

.chapter-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: rgba(148, 163, 184, 0.2);
    color: #cbd5e1;
    font-size: 0.65rem;
    font-weight: 700;
}

.chapter-short {
    white-space: nowrap;
}

.autoplay-controls {
    display: flex;
    align-items: center;
    gap: 6px;
}

.autoplay-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 9px;
    border-radius: 6px;
    background: rgba(99, 102, 241, 0.2);
    border: 1px solid rgba(99, 102, 241, 0.4);
    color: #c7d2fe;
    font-size: 0.72rem;
    font-weight: 600;
    cursor: pointer;
}

.autoplay-btn:hover {
    background: rgba(99, 102, 241, 0.35);
}

.autoplay-btn.playing {
    background: rgba(245, 158, 11, 0.2);
    border-color: rgba(245, 158, 11, 0.4);
    color: #fde68a;
}

.speed-selector {
    display: flex;
    align-items: center;
    gap: 2px;
}

.speed-chip {
    padding: 3px 6px;
    border-radius: 4px;
    background: transparent;
    border: 1px solid transparent;
    color: #64748b;
    font-size: 0.65rem;
    cursor: pointer;
}

.speed-chip:hover {
    color: #94a3b8;
}

.speed-chip.active {
    background: rgba(30, 41, 59, 0.9);
    border-color: rgba(148, 163, 184, 0.25);
    color: #f1f5f9;
}

/* Progress track */
.tour-progress-track {
    width: 100%;
    height: 3px;
    background: rgba(148, 163, 184, 0.1);
    overflow: hidden;
}

.tour-progress-fill {
    height: 100%;
    transition: width 0.1s linear, background-color 0.25s ease;
}

/* Body content */
.tour-step-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.step-meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.step-category-badge {
    padding: 3px 9px;
    border-radius: 999px;
    border: 1px solid;
    font-size: 0.7rem;
    font-weight: 700;
}

.step-counter-label {
    font-size: 0.72rem;
    color: #94a3b8;
    font-weight: 600;
}

.step-main-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #f8fafc;
    margin: 0;
    line-height: 1.35;
}

.step-summary-text {
    font-size: 0.82rem;
    color: #cbd5e1;
    line-height: 1.55;
    margin: 0;
}

/* Highlights */
.highlights-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
}

.highlight-item-card {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 10px;
    background: rgba(30, 41, 59, 0.45);
    border: 1px solid rgba(148, 163, 184, 0.1);
}

.hl-icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    flex-shrink: 0;
    font-size: 0.82rem;
}

.hl-text-col {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.hl-title {
    font-size: 0.78rem;
    font-weight: 700;
    color: #f1f5f9;
    margin: 0;
}

.hl-desc {
    font-size: 0.74rem;
    color: #94a3b8;
    margin: 0;
    line-height: 1.45;
}

/* Code block */
.step-code-block {
    border-radius: 10px;
    overflow: hidden;
    background: #020617;
    border: 1px solid rgba(148, 163, 184, 0.15);
}

.code-block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    background: rgba(30, 41, 59, 0.7);
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    font-size: 0.7rem;
    color: #94a3b8;
}

.copy-code-btn {
    background: transparent;
    border: none;
    color: #cbd5e1;
    font-size: 0.68rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.copy-code-btn:hover {
    color: #ffffff;
}

.code-block-pre {
    margin: 0;
    padding: 10px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.72rem;
    line-height: 1.45;
    color: #e2e8f0;
    overflow-x: auto;
}

/* Pro-Tip */
.pro-tip-banner {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 10px;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.25);
    color: #fef3c7;
    font-size: 0.75rem;
    line-height: 1.45;
}

.pro-tip-icon {
    color: #f59e0b;
    font-size: 1rem;
    flex-shrink: 0;
    margin-top: 1px;
}

/* Footer bar */
.tour-footer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 14px;
    background: #0b1120;
    border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.nav-step-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid rgba(148, 163, 184, 0.24);
    background: rgba(30, 41, 59, 0.85);
    color: #f1f5f9;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.nav-step-btn:hover:not(:disabled) {
    background: rgba(51, 65, 85, 0.95);
    border-color: rgba(129, 140, 248, 0.5);
}

.nav-step-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.nav-step-btn.next {
    border-color: transparent;
    color: #ffffff;
    font-weight: 700;
}

.tour-footer-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
}

.sample-jump-btn,
.focus-node-btn,
.run-test-pill-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 0.72rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
}

.sample-jump-btn {
    background: rgba(99, 102, 241, 0.18);
    border: 1px solid rgba(99, 102, 241, 0.35);
    color: #a5b4fc;
}

.sample-jump-btn:hover {
    background: rgba(99, 102, 241, 0.32);
    color: #ffffff;
}

.focus-node-btn {
    background: rgba(14, 165, 233, 0.18);
    border: 1px solid rgba(14, 165, 233, 0.35);
    color: #7dd3fc;
}

.focus-node-btn:hover {
    background: rgba(14, 165, 233, 0.32);
    color: #ffffff;
}

.run-test-pill-btn {
    background: rgba(16, 185, 129, 0.18);
    border: 1px solid rgba(16, 185, 129, 0.35);
    color: #6ee7b7;
}

.run-test-pill-btn:hover {
    background: rgba(16, 185, 129, 0.32);
    color: #ffffff;
}
</style>
