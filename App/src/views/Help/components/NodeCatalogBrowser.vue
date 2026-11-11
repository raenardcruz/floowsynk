<template>
    <section id="catalog-section" class="catalog-wrapper">
        <div class="catalog-header">
            <div>
                <span class="section-eyebrow">
                    <i class="pi pi-sitemap"></i> Complete Reference
                </span>
                <h2 class="section-heading">Interactive Node Catalog &amp; Data Contracts</h2>
                <p class="section-subheading">
                    Explore every Floowsynk node type across all 8 functional categories, including expected inputs, emitted output variables, and example configurations.
                </p>
            </div>

            <div class="catalog-search-box">
                <i class="pi pi-search search-icon"></i>
                <input
                    v-model="searchQuery"
                    type="text"
                    class="catalog-search-input"
                    placeholder="Search nodes (e.g. webhook, goja, rag, loop)..."
                />
                <button
                    v-if="searchQuery"
                    type="button"
                    class="clear-search-btn"
                    @click="searchQuery = ''"
                >
                    <i class="pi pi-times"></i>
                </button>
            </div>
        </div>

        <!-- Category Filter Chips -->
        <div class="category-filter-row">
            <button
                v-for="cat in categories"
                :key="cat"
                type="button"
                class="category-chip"
                :class="{ active: selectedCategory === cat }"
                @click="selectedCategory = cat"
            >
                {{ cat }}
            </button>
        </div>

        <!-- Node Cards Grid -->
        <div v-if="filteredNodes.length" class="node-catalog-grid">
            <div
                v-for="node in filteredNodes"
                :key="node.nodetype"
                class="node-catalog-card"
                :class="{ expanded: selectedNodeType === node.nodetype }"
                @click="toggleExpand(node.nodetype)"
            >
                <div class="node-card-top">
                    <div
                        class="node-icon-avatar"
                        :style="{ backgroundColor: `${node.accentColor}18`, color: node.accentColor }"
                    >
                        <i :class="node.icon"></i>
                    </div>
                    <div class="node-title-meta">
                        <div class="node-title-line">
                            <h3 class="node-card-title">{{ node.label }}</h3>
                            <code class="node-type-slug">{{ node.nodetype }}</code>
                        </div>
                        <span class="node-cat-tag" :style="{ color: node.accentColor }">
                            {{ node.category }}
                        </span>
                    </div>
                </div>

                <p class="node-card-desc">{{ node.description }}</p>

                <div class="node-io-row">
                    <div class="io-col">
                        <span class="io-label">Inputs:</span>
                        <div class="io-tags">
                            <span v-for="inp in node.inputs" :key="inp" class="io-pill in">{{ inp }}</span>
                        </div>
                    </div>
                    <div class="io-col">
                        <span class="io-label">Outputs:</span>
                        <div class="io-tags">
                            <span v-for="out in node.outputs" :key="out" class="io-pill out">{{ out }}</span>
                        </div>
                    </div>
                </div>

                <div class="node-usecase-box">
                    <strong>Best For:</strong> {{ node.sampleUse }}
                </div>

                <div class="node-payload-preview">
                    <span class="payload-caption">Sample Config / Payload:</span>
                    <pre class="payload-code"><code>{{ node.examplePayload }}</code></pre>
                </div>
            </div>
        </div>

        <div v-else class="empty-catalog-state">
            <i class="pi pi-search"></i>
            <p>No nodes matched "{{ searchQuery }}". Try clearing the filter.</p>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { NODE_CATALOG } from '../Help.constants';

const searchQuery = ref('');
const selectedCategory = ref('All');
const selectedNodeType = ref<string | null>(null);

const categories = [
    'All',
    'Triggers & Input',
    'Logic & Control',
    'Data Transformation',
    'Custom Scripting',
    'Connectivity',
    'AI & Vector',
    'Canvas & Notes',
    'Output'
];

const filteredNodes = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    return NODE_CATALOG.filter((n) => {
        const matchesCat = selectedCategory.value === 'All' || n.category === selectedCategory.value;
        if (!matchesCat) return false;
        if (!q) return true;
        return (
            n.label.toLowerCase().includes(q) ||
            n.nodetype.toLowerCase().includes(q) ||
            n.description.toLowerCase().includes(q) ||
            n.sampleUse.toLowerCase().includes(q)
        );
    });
});

function toggleExpand(nodetype: string) {
    selectedNodeType.value = selectedNodeType.value === nodetype ? null : nodetype;
}
</script>

<style scoped>
.catalog-wrapper {
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--shadow-sm);
}

.catalog-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 16px;
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

.catalog-search-box {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 280px;
}

.search-icon {
    position: absolute;
    left: 12px;
    color: var(--color-text-muted, #64748b);
    font-size: 0.85rem;
}

.catalog-search-input {
    width: 100%;
    padding: 9px 32px 9px 34px;
    border-radius: 10px;
    border: 1px solid var(--color-border, #cbd5e1);
    background: var(--color-surface-hover, #f8fafc);
    color: var(--color-text-primary, #0f172a);
    font-size: 0.82rem;
}

.catalog-search-input:focus {
    outline: 2px solid #6366f1;
    border-color: transparent;
}

.clear-search-btn {
    position: absolute;
    right: 8px;
    border: none;
    background: transparent;
    color: var(--color-text-muted, #64748b);
    cursor: pointer;
}

.category-filter-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-border, #e2e8f0);
}

.category-chip {
    padding: 6px 13px;
    border-radius: 999px;
    border: 1px solid var(--color-border, #cbd5e1);
    background: var(--color-surface-hover, #f8fafc);
    color: var(--color-text-secondary, #334155);
    font-size: 0.76rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.16s ease;
}

.category-chip:hover {
    border-color: #6366f1;
    color: #4f46e5;
}

.category-chip.active {
    background: #4f46e5;
    color: #ffffff;
    border-color: #4f46e5;
}

.node-catalog-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
    gap: 16px;
}

.node-catalog-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    border-radius: 14px;
    background: var(--color-surface-hover, #f8fafc);
    border: 1px solid var(--color-border, #e2e8f0);
    transition: all 0.2s ease;
    cursor: pointer;
}

.node-catalog-card:hover {
    border-color: #6366f1;
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.node-card-top {
    display: flex;
    align-items: center;
    gap: 12px;
}

.node-icon-avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    flex-shrink: 0;
}

.node-title-meta {
    flex: 1;
    min-width: 0;
}

.node-title-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.node-card-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--color-text-primary, #0f172a);
    margin: 0;
}

.node-type-slug {
    font-size: 0.68rem;
    padding: 2px 6px;
    border-radius: 5px;
    background: rgba(148, 163, 184, 0.16);
    color: var(--color-text-secondary, #475569);
}

.node-cat-tag {
    font-size: 0.7rem;
    font-weight: 700;
}

.node-card-desc {
    font-size: 0.8rem;
    line-height: 1.48;
    color: var(--color-text-secondary, #475569);
    margin: 0;
}

.node-io-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding-top: 6px;
    border-top: 1px dashed var(--color-border, #cbd5e1);
}

.io-label {
    display: block;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--color-text-muted, #64748b);
    margin-bottom: 4px;
}

.io-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.io-pill {
    font-size: 0.68rem;
    padding: 2px 6px;
    border-radius: 5px;
    font-family: monospace;
}

.io-pill.in {
    background: rgba(59, 130, 246, 0.1);
    color: #2563eb;
}

.io-pill.out {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
}

.node-usecase-box {
    font-size: 0.76rem;
    line-height: 1.4;
    color: var(--color-text-primary, #1e293b);
    background: rgba(99, 102, 241, 0.06);
    padding: 7px 10px;
    border-radius: 8px;
}

.node-payload-preview {
    margin-top: auto;
}

.payload-caption {
    display: block;
    font-size: 0.68rem;
    font-weight: 600;
    color: var(--color-text-muted, #64748b);
    margin-bottom: 4px;
}

.payload-code {
    margin: 0;
    padding: 8px 10px;
    border-radius: 8px;
    background: #0f172a;
    color: #a5b4fc;
    font-family: 'Fira Code', monospace;
    font-size: 0.7rem;
    overflow-x: auto;
}

.empty-catalog-state {
    text-align: center;
    padding: 36px 20px;
    color: var(--color-text-muted, #64748b);
}
</style>
