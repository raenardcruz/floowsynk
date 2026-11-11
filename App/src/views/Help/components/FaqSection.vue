<template>
    <section id="faq-section" class="faq-wrapper">
        <div class="faq-header">
            <div>
                <span class="section-eyebrow">
                    <i class="pi pi-question-circle"></i> Knowledge Base &amp; Troubleshooting
                </span>
                <h2 class="section-heading">Frequently Asked Questions &amp; Deep Dives</h2>
                <p class="section-subheading">
                    Quick answers on variable scoping, Pin Data, Goja timeout rules, SSRF security guards, and Staging-to-Production promotion.
                </p>
            </div>

            <div class="faq-search-box">
                <i class="pi pi-search search-icon"></i>
                <input
                    v-model="searchQuery"
                    type="text"
                    class="faq-search-input"
                    placeholder="Search questions (e.g. SSRF, $vars, timeout, MCP)..."
                />
                <button
                    v-if="searchQuery"
                    type="button"
                    class="clear-btn"
                    @click="searchQuery = ''"
                >
                    <i class="pi pi-times"></i>
                </button>
            </div>
        </div>

        <div class="faq-accordion-list">
            <div
                v-for="item in filteredFaq"
                :key="item.id"
                class="faq-item"
                :class="{ open: openFaqIds.includes(item.id) }"
            >
                <button
                    type="button"
                    class="faq-question-bar"
                    :aria-expanded="openFaqIds.includes(item.id)"
                    @click="toggleFaq(item.id)"
                >
                    <div class="faq-q-left">
                        <span class="faq-cat-badge">{{ item.category }}</span>
                        <span class="faq-q-text">{{ item.question }}</span>
                    </div>
                    <i
                        class="pi faq-chevron"
                        :class="openFaqIds.includes(item.id) ? 'pi-chevron-up' : 'pi-chevron-down'"
                    ></i>
                </button>

                <div v-if="openFaqIds.includes(item.id)" class="faq-answer-body">
                    <p>{{ item.answer }}</p>
                    <div class="faq-tags-row">
                        <span v-for="tag in item.tags" :key="tag" class="faq-tag-chip">#{{ tag }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="!filteredFaq.length" class="empty-faq-state">
            <i class="pi pi-info-circle"></i>
            <p>No FAQ entries matched "{{ searchQuery }}".</p>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { FAQ_ITEMS } from '../Help.constants';

const searchQuery = ref('');
const openFaqIds = ref<string[]>([FAQ_ITEMS[0].id, FAQ_ITEMS[1].id]);

const filteredFaq = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
        (item) =>
            item.question.toLowerCase().includes(q) ||
            item.answer.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.tags.some((t) => t.toLowerCase().includes(q))
    );
});

function toggleFaq(id: string) {
    if (openFaqIds.value.includes(id)) {
        openFaqIds.value = openFaqIds.value.filter((i) => i !== id);
    } else {
        openFaqIds.value.push(id);
    }
}
</script>

<style scoped>
.faq-wrapper {
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--shadow-sm);
}

.faq-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
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

.faq-search-box {
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

.faq-search-input {
    width: 100%;
    padding: 9px 32px 9px 34px;
    border-radius: 10px;
    border: 1px solid var(--color-border, #cbd5e1);
    background: var(--color-surface-hover, #f8fafc);
    color: var(--color-text-primary, #0f172a);
    font-size: 0.82rem;
}

.faq-search-input:focus {
    outline: 2px solid #6366f1;
    border-color: transparent;
}

.clear-btn {
    position: absolute;
    right: 8px;
    border: none;
    background: transparent;
    color: var(--color-text-muted, #64748b);
    cursor: pointer;
}

.faq-accordion-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.faq-item {
    border-radius: 12px;
    border: 1px solid var(--color-border, #e2e8f0);
    background: var(--color-surface-hover, #f8fafc);
    overflow: hidden;
    transition: border-color 0.18s ease;
}

.faq-item.open {
    border-color: rgba(99, 102, 241, 0.45);
}

.faq-question-bar {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
    color: var(--color-text-primary, #0f172a);
}

.faq-q-left {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}

.faq-cat-badge {
    font-size: 0.68rem;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 999px;
    background: rgba(79, 70, 229, 0.12);
    color: #4f46e5;
}

.faq-q-text {
    font-size: 0.9rem;
    font-weight: 700;
}

.faq-chevron {
    color: var(--color-text-muted, #64748b);
    font-size: 0.85rem;
}

.faq-answer-body {
    padding: 0 16px 15px 16px;
    color: var(--color-text-secondary, #334155);
    font-size: 0.84rem;
    line-height: 1.6;
    border-top: 1px dashed var(--color-border, #e2e8f0);
    padding-top: 12px;
}

.faq-answer-body p {
    margin: 0 0 10px 0;
}

.faq-tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.faq-tag-chip {
    font-size: 0.7rem;
    color: var(--color-text-muted, #64748b);
    background: rgba(148, 163, 184, 0.14);
    padding: 2px 8px;
    border-radius: 6px;
}

.empty-faq-state {
    text-align: center;
    padding: 30px;
    color: var(--color-text-muted, #64748b);
}
</style>
