<template>
    <Fieldset :pt="{ root: { style: 'width: 100%' }, content: { class: 'custom-list' } }" :legend="label">
        <div class="custom-list__items">
            <Panel v-for="(item, index) in modelValue" :key="index" :header="`Item ${index + 1}`" toggleable>
                <component
                    v-for="fieldItem in Object.keys(item)"
                    :is="componentSwitcher(item, fieldItem).component"
                    v-bind="componentSwitcher(item, fieldItem).props"
                    :key="fieldItem"
                    v-model="item[fieldItem]"
                />
            </Panel>
        </div>
        <Button label="Add" @click="clickHandler()" />
    </Fieldset>
</template>

<script setup lang="ts">
import type { CustomListProps } from './CustomList.types'
import Button from '@/components/Composable/UI/Buttons/PrimaryButton.vue'
import TextInput from '@/components/Composable/UI/Inputs/TextInput.vue'
import Fieldset from 'primevue/fieldset'
import Panel from 'primevue/panel'
import Select from 'primevue/select'
import { iconList } from '@/views/Pages/Tools/Tools.constants'


const props = defineProps<CustomListProps>()
const modelValue = defineModel<any[]>({ default: [] })

const clickHandler = () => {
    modelValue.value = [...modelValue.value, { ...props.template }]
}
const componentSwitcher = (item: any, fieldItem: string) => {
    if (fieldItem.toLowerCase() === 'icon') {
        return {
            component: Select,
            props: {
                label: fieldItem,
                options: iconList,
                placeholder: `Select ${fieldItem}`,
                filter: true,
                editable: true
            }
        }
    }
    switch (typeof item[fieldItem]) {
        case 'string':
            return {
                component: TextInput,
                props: {
                    label: fieldItem,
                    placeholder: `Enter ${fieldItem}`
                }
            }
        case 'number':
            return {
                component: TextInput,
                props: {
                    label: fieldItem,
                    type: 'number',
                    placeholder: `Enter ${fieldItem}`
                }
            }
        default:
            return TextInput
    }
}
</script>

<style scoped>
.custom-list__items {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
:deep(.custom-list) {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>