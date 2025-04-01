<template>
    <div class="gallery-box">
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
                @click="cardClicked(process)">
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
    </div>
</template>

<script setup lang="ts">
import { createProcess, cardClicked, initWorkflows } from './Process.List.helper'
import WorkflowIcon from "@/components/Workflow/Workflow.Icon.vue"
import { useProcessListStore, useProcessListHooks } from './Process.List.hooks'

const { search } = useProcessListStore()
const { filteredProcesses } = useProcessListHooks()
initWorkflows()
</script>

<style scoped src="./Process.List.styles.css"></style>