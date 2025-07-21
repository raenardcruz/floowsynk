<template>
    <CollapsibleSidebar position="left" v-model="showSideBar">
         <div class="input">
                <input type="search" placeholder="Search Nodes" v-model="search">
            </div>
            <div class="nodes expand">
                <div class="node" v-for="node in searchNode" :key="node.id" :draggable="true"
                    @dragstart="onDragStart(node)" v-if="search.length > 0">
                    <div class="node-icon">
                        <span class="material-symbols-outlined">{{ node.icon?.name || "indeterminate_question_box" }}</span>
                    </div>
                    <div class="node-type">
                        {{ node.nodetype }}
                    </div>
                </div>
            </div>
            <div class="group" @click="expandToggle('all')" v-if="search.length == 0">
                <div class="name">
                    <span class="material-symbols-outlined grp-icon">apps</span>
                    <span>All</span>
                    <span class="material-symbols-outlined expand-icon"
                        :class="{ 'expand': expandGroup.includes('all') }">arrow_forward_ios</span>
                </div>
                <div class="description">Contains all the nodes</div>
                <div class="nodes" :class="{ 'expand': expandGroup.includes('all') }">
                    <div class="node" v-for="node in nodes" :key="node.id" :draggable="true"
                        @dragstart="onDragStart(node)" @click.stop>
                        <div class="node-icon" >
                            <span class="material-symbols-outlined">{{ node.icon?.name || "indeterminate_question_box" }}</span>
                        </div>
                        <div class="node-type">
                            {{ node.nodetype }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="group" v-for="group in groups" :key="group.id" @click="expandToggle(group.name)"
                v-if="search.length == 0">
                <div class="name">
                    <span class="material-symbols-outlined grp-icon">apps</span>
                    <span>{{ group.name }}</span>
                    <span class="material-symbols-outlined expand-icon"
                        :class="{ 'expand': expandGroup.includes(group.name) }">arrow_forward_ios</span>
                </div>
                <div class="description">{{ group.description }}</div>
                <div class="nodes" :class="{ 'expand': expandGroup.includes(group.name) }">
                    <div class="node" v-for="node in groupNodes(group.id)" :key="node.id" :draggable="true"
                        @dragstart="onDragStart(node)" @click.stop>
                        <div class="node-icon">
                            <span class="material-symbols-outlined">{{ node.icon?.name || "indeterminate_question_box" }}</span>
                        </div>
                        <div class="node-type">
                            {{ node.nodetype }}
                        </div>
                    </div>
                </div>
            </div>
    </CollapsibleSidebar>
</template>


<script setup lang="ts">
import { useSidebarCanvasStore, useFloowsynkNodeHooks } from './Workflow.Sidebar.Canvas.hooks'
import { nodes } from "@/views/Workflow/Nodes"
import { groups } from "@/views/Workflow/Nodes"
import { onDragStart, expandToggle, groupNodes } from './Workflow.Sidebar.Canvas.helper'
import CollapsibleSidebar from '@/components/Composable/UI/Sidebar/CollapsibleSidebar.vue'

const {
    showSideBar,
    search,
    expandGroup,
} = useSidebarCanvasStore()
const { searchNode } = useFloowsynkNodeHooks()
</script>

<style scoped src="./Workflow.Sidebar.Canvas.styles.css"></style>