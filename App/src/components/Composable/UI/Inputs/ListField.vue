<template>
    <div class="array-container">
        <div class="label">{{ label }}</div>
        <div class="list-container" v-for="(_, index) in arrayValue" :key="index">
            <component
            :key="index"
            :is="getComponent(index).component"
            v-bind="getComponent(index).props"
            v-model="arrayValue[index]" />
        </div>
        <div class="action-section">
            <Select v-model="dataType" :options="options" />
            <button @click="addList">+</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Select from './Select.vue' 
import TextInput from './TextInput.vue'
import Checkbox from './Checkbox.vue'
import { NodeDataArray, ArrayDataType, KeyValue } from 'proto/floowsynk_pb'


const value = defineModel({
    type: Object as () => NodeDataArray.AsObject,
    default: () => ({
        type: ArrayDataType.STRING,
        stringitemsList: [],
        intitemsList: [],
        boolitemsList: [],
        keyvalueitemsList: []
    })
})

defineProps({
    label: {
        type: String,
        default: ''
    }
})

const dataType = ref<ArrayDataType>(value.value.type)
const stringList = ref<string[]>(value.value.stringitemsList)
const intList = ref<number[]>(value.value.intitemsList)
const boolList = ref<boolean[]>(value.value.boolitemsList)
const keyValueList = ref<KeyValue.AsObject[]>(value.value.keyvalueitemsList)

// Refactored to improve efficiency and readability
const arrayValue = computed({
    get() {
        const listMap = {
            [ArrayDataType.STRING]: stringList.value,
            [ArrayDataType.INT]: intList.value,
            [ArrayDataType.BOOL]: boolList.value,
            [ArrayDataType.KEYVALUE]: keyValueList.value
        };
        return listMap[dataType.value] || [];
    },
    set(newValue) {
        const listSetterMap = {
            [ArrayDataType.STRING]: () => stringList.value = newValue as string[],
            [ArrayDataType.INT]: () => intList.value = newValue as number[],
            [ArrayDataType.BOOL]: () => boolList.value = newValue as boolean[],
            [ArrayDataType.KEYVALUE]: () => keyValueList.value = newValue as KeyValue.AsObject[]
        };
        listSetterMap[dataType.value]?.();
    }
});

const options = [
    { value: ArrayDataType.STRING, label: 'String' },
    { value: ArrayDataType.INT, label: 'Number' },
    { value: ArrayDataType.BOOL, label: 'Boolean' },
    { value: ArrayDataType.KEYVALUE, label: 'Key Value Pair' }
]

const getComponent = (index: number) => {
    const componentMap = {
        [ArrayDataType.STRING]: {
            component: TextInput,
            props: {
                type: 'text',
                placeholder: 'Enter text',
                label: `Item ${index + 1}`
            }
        },
        [ArrayDataType.INT]: {
            component: TextInput,
            props: {
                type: 'number',
                placeholder: 'Enter number',
                label: `Item ${index + 1}`
            }
        },
        [ArrayDataType.BOOL]: {
            component: Checkbox,
            props: {
                label: `Item ${index + 1}`
            }
        },
        [ArrayDataType.KEYVALUE]: {
            component: TextInput,
            props: {
                type: 'text',
                placeholder: 'Enter key',
                label: `Key ${index + 1}`
            }
        }
    };
    return componentMap[dataType.value] || null;
};

const addList = () => {
    const listAdderMap = {
        [ArrayDataType.STRING]: () => stringList.value.push(''),
        [ArrayDataType.INT]: () => intList.value.push(0),
        [ArrayDataType.BOOL]: () => boolList.value.push(false),
        [ArrayDataType.KEYVALUE]: () => keyValueList.value.push({ key: '', value: '' })
    };
    listAdderMap[dataType.value]?.();
};
</script>

<style scoped>
.array-container {
    display: flex;
    position: relative;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    border: 1px solid var(--grey-4);
    min-height: 40px;
    border-radius: 10px;
    padding: 20px 10px;
}
.label {
    font-size: 14px;
    color: var(--black);
    display: flex;
    position: absolute;
    top: -10px;
    left: 10px;
    background: var(--white-1);
}
.action-section {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
    gap: 10px;
}
.action-section button {
    width: 100%;
    border-radius: 50px;
    border: none;
    background: var(--grey-4);
    color: var(--white-1);
    font-size: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
}
.action-section button:hover {
    background: var(--blue-2);
}
.list-container {
    display: flex;
    flex-direction: column;
    position: relative;
    justify-content: center;
    align-items: center;
    gap: 24px;
}
</style>