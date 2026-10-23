<template>
    <div class="gallery-box" v-if="!isLoading">
        <div class="gallery-header">
            <div>
                <h1 class="page-title">Process Gallery</h1>
                <p class="page-info">
                    Showing <span class="count-badge">{{ filteredProcesses.length }}</span> of {{ processes.length }} Workflows
                </p>
            </div>
            <div class="gallery-search">
                <span class="material-symbols-outlined search-icon">search</span>
                <input class="search-input" v-model="search" placeholder="Search processes by name or tag..." />
                <span v-if="search" class="material-symbols-outlined clear-icon" @click="search = ''">close</span>
            </div>
        </div>

        <div class="cards-gallery">
            <div class="create-card hover-lift" @click="createProcess">
                <div class="create-icon-wrapper">
                    <span class="material-symbols-outlined">add</span>
                </div>
                <div class="create-text">
                    <div class="create-title">New Workflow</div>
                    <div class="create-sub">Build from scratch</div>
                </div>
            </div>
            <div class="card glass-card hover-lift" v-for="process in filteredProcesses" :key="process.id" :class="process.type"
                @click="cardClicked($event, process)">
                <div class="card-top">
                    <div class="type-badge" :class="'type-badge--' + process.type">
                        <workflow-icon :type="process.type" />
                        <span class="type-text">{{ process.type }}</span>
                    </div>
                    <span v-if="process.ismodified" class="modified-tag" title="Modified in Production (out of sync with Staging)">
                        <span class="material-symbols-outlined">sync_problem</span> Out of Sync
                    </span>
                </div>
                <div class="card-body">
                    <div class="card-title">{{ process.name || 'Untitled Process' }}</div>
                    <div class="card-description">{{ process.description || 'No description provided' }}</div>
                </div>
                <div class="card-footer" v-if="process.tagsList && process.tagsList.length">
                    <div class="tag-pill" v-for="tag in process.tagsList.filter(t => t !== 'No Tags')" :key="tag">
                        #{{ tag }}
                    </div>
                </div>
            </div>
        </div>

        <div class="run-history">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <Collapsible title="Execution History" caption="Past execution runs and replays across workflows"
                    v-model="showContent" style="flex: 1;">
                    <div class="history-container" v-bind="containerProps">
                        <div v-bind="wrapperProps">
                            <Header columnstyle="repeat(3, 1fr)">
                                <div class="header">ID</div>
                                <div class="header">Workflow</div>
                                <div class="header">Date</div>
                            </Header>
                            <Row columnstyle="repeat(3, 1fr)" v-for="(item, index) in list" :key="index"
                                @click="historyClicked(item.data)">
                                <div>{{ item.data.id }}</div>
                                <div>{{ item.data.workflowname }}</div>
                                <div>{{ item.data.rundate }}</div>
                            </Row>
                        </div>
                    </div>
                </Collapsible>
                <button v-if="history.length > 0" type="button" class="clear-history-btn" @click="clearHistoryAction" title="Clear All Run History">
                    <span class="material-symbols-outlined">delete_sweep</span>
                    <span>Clear</span>
                </button>
            </div>
        </div>
    </div>
    <div class="gallery-skeleton-container" v-else>
        <div class="skeleton-shimmer" style="height: 40px; width: 240px; margin-bottom: 12px;"></div>
        <div class="skeleton-shimmer" style="height: 20px; width: 160px; margin-bottom: 24px;"></div>
        <div class="cards-gallery">
            <div class="skeleton-shimmer" style="height: 160px; width: 280px; border-radius: 16px;" v-for="i in 6" :key="i"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createProcess, cardClicked, initWorkflows, historyClicked, clearHistoryAction } from './Process.List.helper'
import WorkflowIcon from "@/views/Workflow/Workflow.Icon.vue"
import { useProcessListStore, useProcessListHooks } from './Process.List.hooks'
import { useAsyncState, useVirtualList } from '@vueuse/core'
import { Headers as Header, Row } from '@/components/Composable/UI/Table'
import { Collapsible } from '@/components/Composable/UI/Collapsible'

const { search, history, processes } = useProcessListStore()
const { filteredProcesses } = useProcessListHooks()
const { isLoading } = useAsyncState(initWorkflows, null)
const showContent = ref(true)
const { list, containerProps, wrapperProps } = useVirtualList(history, {
    itemHeight: 40,

})
</script>

<style scoped src="./Process.List.styles.css"></style>