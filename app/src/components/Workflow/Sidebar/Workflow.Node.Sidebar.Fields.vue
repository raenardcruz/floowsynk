<template>
    <div class="input" v-for="(value, key) in props.modelValue" :key="key" v-if="props.modelValue.constructor == Object">
        <legend class="sidebar-legend">
            <div class="checkbox" v-if="value.constructor == Boolean">
                <input type="checkbox" v-model="props.modelValue[key]" />
                <div class="label">{{ toSentenceCase(key.toString()) }}</div>
            </div>
            <span v-else>{{ toSentenceCase(key.toString()) }}</span>
        </legend>
        <input class="sidebar-input" type="text" v-model="props.modelValue[key]" v-if="value.constructor == String" />
        <input class="sidebar-input" type="number" v-model="props.modelValue[key]" v-if="value.constructor == Number" />
        <div class="array-container" v-if="value.constructor == Array">
            <div class="child-container" v-for="(v, i) in value" :key="v">
                <span class="material-symbols-outlined remove-array" @click="removeArrayItem(i, key)" v-if="i != 0">delete</span>
                <WorkflowNodeSidebarFields v-model="props.modelValue[key][i]" />
            </div>
            <div class="btn" @click="addArrayItem(key)">
                <span class="material-symbols-outlined">add</span>
            </div>
        </div>
    </div>
    <div class="input" v-else>
        <input class="sidebar-input" type="text" v-model="props.modelValue" v-if="props.modelValue.constructor == String" />
        <input class="sidebar-input" type="number" v-model="props.modelValue" v-if="props.modelValue.constructor == Number" />
        <input type="checkbox" v-model="props.modelValue" v-if="props.modelValue.constructor == Boolean" />
    </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import WorkflowNodeSidebarFields from './Workflow.Node.Sidebar.Fields.vue';

const props = defineProps<{
    modelValue: Record<string, any>;
}>();

const emit = defineEmits(['update:modelValue']);

watch(() => props.modelValue, (value) => {
    emit('update:modelValue', value);
})

const toSentenceCase = function (str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2') // insert space between camelCase words
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // insert space between PascalCase words
        .replace(/^./, (char) => char.toUpperCase()); // capitalize the first letter
}

const addArrayItem = function (key: string) {
    if (Array.isArray(props.modelValue[key]) && props.modelValue[key].length == 0) {
        props.modelValue[key].push('');
    } else if ( props.modelValue[key].length > 0 && props.modelValue[key][0].constructor == Object) {
        const newItem = JSON.parse(JSON.stringify(props.modelValue[key][0]));
        for (const prop in newItem) {
            if (newItem.hasOwnProperty(prop)) {
            newItem[prop] = '';
            }
        }
        props.modelValue[key].push(newItem);
    }
}

const removeArrayItem = function (index: any, key: string) {
    props.modelValue[key].splice(index, 1);
}

</script>

<style scoped>
.input {
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: left;
    align-items: baseline;
    margin-bottom: 10px;
}
.sidebar-input {
    display: flex;
    position: relative;
    height: 30px;
    width: fit-content;
    min-width: 200px;
    padding: 5px;
    border-radius: 50px;
    border: 1px solid #ccc;
}
.sidebar-legend {
    display: flex;
    font-size: 13px;
}
.checkbox {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.checkbox input[type="checkbox"] {
    appearance: none;
    width: 20px;
    height: 20px;
    border: 2px solid #ccc;
    border-radius: 4px;
    position: relative;
    outline: none;
    cursor: pointer;
    transition: background 0.3s, border-color 0.3s;
    margin-right: 10px;
}

.checkbox input[type="checkbox"]:checked {
    background: #3B90D4;
    border-color: #3B90D4;
}

.checkbox input[type="checkbox"]:checked::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 6px;
    width: 6px;
    height: 12px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.checkbox label {
    margin-left: 8px;
    font-size: 13px;
    color: #333;
}

.array-container {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
    height: fit-content;
    width: 100%;
    margin: 10px 0px;
}
.array-container .child-container {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1px solid #ccc;
    border-radius: 10px;
    height: fit-content;
    min-height: 100px;
    width: 100%;
    padding: 10px;
}
.btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px 10px;
    border-radius: 50px;
    background: #E6E5E5;
    box-shadow: 3px 3px 5px #868686, -3px -3px 5px #fff;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s;
}
.btn:hover {
    box-shadow: inset 3px 3px 5px #868686, inset -3px -3px 5px #fff;
}
.remove-array {
    display: flex;
    position: absolute;
    top: 5px;
    right: 5px;
    cursor: pointer;
    color: #BC0F26;
    z-index: 100;
}
</style>