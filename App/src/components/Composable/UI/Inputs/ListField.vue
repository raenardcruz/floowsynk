<template>
    <div class="array-container">
        <div class="label">{{ label }}</div>
        <div class="list-container" v-for="(_, index) in arrayValue" :key="index">
            <span class="material-symbols-outlined remove-btn" title="Remove Item" @click="removeItem(index)">close</span>
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
import { ref, computed } from 'vue'
import Select from './Select.vue' 
import TextCodeInput from './TextCodeInput.vue'
import Checkbox from './Checkbox.vue'
import KeyValueField from './KeyValue.vue'
import { NodeDataArray, ArrayDataType, KeyValue } from 'proto/workflow/workflow_pb'


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
            component: TextCodeInput,
            props: {
                type: 'text',
                placeholder: 'Enter text',
                label: `List Item ${index + 1}`
            }
        },
        [ArrayDataType.INT]: {
            component: TextCodeInput,
            props: {
                type: 'number',
                placeholder: 'Enter number',
                label: `List Item ${index + 1}`
            }
        },
        [ArrayDataType.BOOL]: {
            component: Checkbox,
            props: {
                label: `List Item ${index + 1}`
            }
        },
        [ArrayDataType.KEYVALUE]: {
            component: KeyValueField,
            props: {
                label: `List Item ${index + 1}`
            }
        }
    };
    return componentMap[dataType.value] || null;
};

const addList = () => {
    if (!stringList.value) stringList.value = [];
    if (!intList.value) intList.value = [];
    if (!boolList.value) boolList.value = [];
    if (!keyValueList.value) keyValueList.value = [];

    const listAdderMap = {
        [ArrayDataType.STRING]: () => stringList.value.push(''),
        [ArrayDataType.INT]: () => intList.value.push(0),
        [ArrayDataType.BOOL]: () => boolList.value.push(false),
        [ArrayDataType.KEYVALUE]: () => keyValueList.value.push({ key: '', value: '' })
    };
    listAdderMap[dataType.value]?.();
};

const removeItem = (index: number) => {
    const listRemoverMap = {
        [ArrayDataType.STRING]: () => stringList.value.splice(index, 1),
        [ArrayDataType.INT]: () => intList.value.splice(index, 1),
        [ArrayDataType.BOOL]: () => boolList.value.splice(index, 1),
        [ArrayDataType.KEYVALUE]: () => keyValueList.value.splice(index, 1)
    };
    listRemoverMap[dataType.value]?.();
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
    margin-top: 12px;
}
.label {
    display: flex;
    position: absolute;
    top: -10px;
    left: 10px;
    font-size: 12px;
    background: var(--grey-3);
    color: var(--white-1);
    border: 1px solid var(--grey-4);
    border-radius: 10px;
    padding: 0px 8px;
    font-weight: 500;
    box-shadow: 2px 4px 8px var(--grey-4);
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
.remove-btn {
    display: flex;
    position: absolute;
    top: 20px;
    right: 10px;
    color: var(--red-3);
    z-index: 100;
    cursor: pointer;
    font-size: 18px;
    background: var(--grey-4);
    border-radius: 50%;
    padding: 5px;
    transition: all 0.3s ease;
}
.remove-btn:hover {
    background: var(--red-3);
    color: var(--white-1);
    transform: scale(1.1);
}
</style>