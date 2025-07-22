<template>
    <div class="gallery-box" v-if="!isLoading">
        <div class="page-title">Process Gallery</div>
        <div class="page-info">
            <span>Showing</span>
            <span style="color: #3990C5">10</span>
            <span>out of 30 Processes</span>
        </div>
        <div class="gallery-search">
            <input class="search-box" type="search" placeholder="Search" v-model="search">
        </div>
        <div class="cards-gallery">
            <div class="create" @click="createProcess">
                <img src="/src/components/Icons/add.svg" alt="add" />
            </div>
            <div class="card" v-for="process in filteredProcesses" :key="process.id" :class="process.type"
                @click="cardClicked($event, process)">
                <div class="type">
                    <workflow-icon :type="process.type" />
                    <span class="type-text">{{ process.type }}</span>
                </div>
                <div class="card-title">
                    <span>{{ process.name }}</span>
                </div>
                <div class="card-description">{{ process.description }}</div>
                <div class="tags">
                    <div class="tag" v-for="tab in process.tagsList">{{ tab }}</div>
                </div>
            </div>
        </div>
        <div class="run-history">
            <Collapsible title="Run History" caption="List of all the processes that have been run"
                v-model="showContent">
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
        </div>
    </div>
    <div v-else>
        <Loading text="Please wait while we fetch your data" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createProcess, cardClicked, initWorkflows, historyClicked } from './Process.List.helper'
import WorkflowIcon from "@/views/Workflow/Workflow.Icon.vue"
import { useProcessListStore, useProcessListHooks } from './Process.List.hooks'
import { useAsyncState, useVirtualList } from '@vueuse/core'
import Header from '@/components/Composable/UI/Table/Headers.vue'
import Row from '@/components/Composable/UI/Table/Row.vue'
import Collapsible from '@/components/Composable/UI/Collapsible/Collapsible.vue'
import Loading from '@/components/Composable/UI/Loading/Loading.vue'

const { search, history } = useProcessListStore()
const { filteredProcesses } = useProcessListHooks()
const { isLoading } = useAsyncState(initWorkflows, null)
const showContent = ref(true)
const { list, containerProps, wrapperProps } = useVirtualList(history, {
    itemHeight: 40,

})
</script>

<style scoped src="./Process.List.styles.css"></style>