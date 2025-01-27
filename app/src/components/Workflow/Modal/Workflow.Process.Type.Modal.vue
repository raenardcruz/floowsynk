<template>
    <div class="background" v-if="isModalVisible">
        <div class="modal">
            <div class="modal-header">
                <span class="material-symbols-outlined close-btn" @click="isModalVisible = false">close</span>
                <h4 style="margin-bottom: 20px;">Process Type</h4>
            </div>
            <div class="modal-content">
                <div class="type-content">
                    <div class="card" :class="{ selected: isSelected('defaultnode') || isSelected('default') }" @click="selectNode('defaultnode')">
                        <WorkflowIcon type="defaultnode" />
                        <span>Default</span>
                    </div>
                    <div class="card" :class="{ selected: isSelected('webhook') }" @click="selectNode('webhook')">
                        <WorkflowIcon type="webhook" />
                        <span>Webhook</span>
                    </div>
                    <div class="card" :class="{ selected: isSelected('interval') }" @click="selectNode('interval')">
                        <WorkflowIcon type="interval" />
                        <span>Interval</span>
                    </div>
                    <div class="card" :class="{ selected: isSelected('events') }" @click="selectNode('events')">
                        <WorkflowIcon type="events" />
                        <span>Events</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import WorkflowIcon from '../Workflow.Icon.vue';
    import TypeModal from './Workflow.Modal';
    import { startNodes } from '../Nodes/node';
    import { defineProps, ref, reactive } from 'vue';

    const props = defineProps(['id']);
    const isModalVisible = ref(false);

    const tab = reactive(TypeModal.getTab(props.id));
    const isSelected = (type: string) => tab.type === type;
    const toggleModal = () => isModalVisible.value = !isModalVisible.value;
    const selectNode = (type: string) => {
        if (tab.nodes) {
            tab.type = type;
            let tmpNodes = [...tab.nodes];
            tmpNodes[0] = startNodes[type];
            tab.nodes = [];
            setTimeout(() => tab.nodes = tmpNodes, 0);
        }
    };

    defineExpose({ toggleModal });
</script>

<style scoped src="./Workflow.Modal.css"></style>
<style scoped>
.type-content {
    position: absolute;
    display: grid;
    grid-template-columns: repeat(2, auto);
    align-content: center;
    justify-content: center;
    align-self: center;
    grid-gap: 20px;
    width: 100%;
    height: fit-content;
}
.type-content .card {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f5f5f5;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 3px 3px 5px #868686,-3px -3px 5px #fff;
    cursor: pointer;
    transition: all 0.3s ease;
}
.type-content .card:hover {
    box-shadow: 3px 3px 10px #868686,-3px -3px 10px #fff;
}
.type-content .card.selected {
    box-shadow: inset 3px 3px 5px #868686, inset -3px -3px 5px #fff !important;
}
</style>