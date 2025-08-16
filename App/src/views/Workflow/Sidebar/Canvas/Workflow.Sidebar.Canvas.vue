<template>
    <CollapsibleSidebar position="left" v-model="showSideBar" :showCloseButton="false">
        <div class="input">
            <TextInput v-model="search" placeholder="Search" />
        </div>
        <div class="nodes expand">
            <div class="node" v-for="node in searchNode" :key="node.id" :draggable="true" @dragstart="onDragStart(node)"
                v-if="search.length > 0">
                <div class="node-icon">
                    <span class="material-symbols-outlined">{{ node.icon?.name || "indeterminate_question_box" }}</span>
                </div>
                <div class="node-type">
                    {{ node.nodetype }}
                </div>
            </div>
        </div>
        <Accordion v-if="search.length == 0">
            <AccordionPanel value="0">
                <AccordionHeader><span class="material-symbols-outlined grp-icon">apps</span>All</AccordionHeader>
                <AccordionContent>
                    <span>Contains all the nodes</span>
                    <div class="nodes">
                        <div class="node" v-for="node in nodes" :key="node.id" :draggable="true"
                            @dragstart="onDragStart(node)" @click.stop>
                            <div class="node-icon">
                                <span class="material-symbols-outlined">{{ node.icon?.name ||
                                    "indeterminate_question_box"
                                }}</span>
                            </div>
                            <div class="node-type">
                                {{ node.nodetype }}
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionPanel>
            <AccordionPanel v-for="(group, index) in groups" :key="group.id" :value="index">
                <AccordionHeader><span class="material-symbols-outlined grp-icon">apps</span>{{ group.name }}</AccordionHeader>
                <AccordionContent>
                    <p>{{ group.description }}</p>
                    <div class="nodes">
                        <div class="node" v-for="node in groupNodes(group.id)" :key="node.id" :draggable="true"
                            @dragstart="onDragStart(node)" @click.stop>
                            <div class="node-icon">
                                <span class="material-symbols-outlined">{{ node.icon?.name ||
                                    "indeterminate_question_box"
                                    }}</span>
                            </div>
                            <div class="node-type">
                                {{ node.nodetype }}
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionPanel>
        </Accordion>
    </CollapsibleSidebar>
</template>


<script setup lang="ts">
import { useSidebarCanvasStore, useFloowsynkNodeHooks } from './Workflow.Sidebar.Canvas.hooks'
import { nodes } from "@/views/Workflow/Nodes"
import { groups } from "@/views/Workflow/Nodes"
import { onDragStart, expandToggle, groupNodes } from './Workflow.Sidebar.Canvas.helper'
import { CollapsibleSidebar } from '@/components/Composable/UI/Sidebar'
import { TextInput } from '@/components/Composable/UI/Inputs'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'

const {
    showSideBar,
    search,
    expandGroup,
} = useSidebarCanvasStore()
const { searchNode } = useFloowsynkNodeHooks()
</script>

<style scoped src="./Workflow.Sidebar.Canvas.styles.css"></style>