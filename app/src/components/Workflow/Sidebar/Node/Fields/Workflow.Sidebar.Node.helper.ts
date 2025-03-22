import { useSidebarNodeStore } from '../Workflow.Sidebar.Node.hooks'
import { SidebarNodeProps } from '../Workflow.Sidebar.Node.types'
import { EMIT_MODEL } from './Workflow.Sidebar.Node.Fields.constants'

const { modalStates, arraytype } = useSidebarNodeStore();

export const showModal = (key: string) => {
    modalStates.value[key] = true;
};

export const inputHandler = function (e: Event, emit: (event: "update:modelValue", ...args: any[]) => void) {
    if (e.target) {
        let el = (e.target as HTMLInputElement)
        if (el.type == "checkbox") {
            emit(EMIT_MODEL, el.checked)
        } else {
            emit(EMIT_MODEL, el.value);
        }
    }
}

export const useSidebarNodeFieldsHelper = (props: SidebarNodeProps) => {
    const removeArrayItem = function (index: any, key: string) {
        props.modelValue[key].splice(index, 1);
    }
    const addArrayItem = function (key: string) {
        if (props.modelValue[key].constructor == Array && props.modelValue[key].length == 0) {
            switch (arraytype.value) {
                case 'keyvalue':
                    props.modelValue[key].push({ key: '', value: '' });
                    break;
                case 'string':
                    props.modelValue[key].push('');
                    break;
                case 'number':
                    props.modelValue[key].push(0);
                    break;
                case 'boolean':
                    props.modelValue[key].push(false);
                    break;
            }
        } else {
            const firstItemType = props.modelValue[key][0].constructor;
            switch (firstItemType) {
                case String:
                    props.modelValue[key].push('');
                    break;
                case Number:
                    props.modelValue[key].push(0);
                    break;
                case Object:
                    const newItem = JSON.parse(JSON.stringify(props.modelValue[key][0]));
                    for (const prop in newItem) {
                        if (newItem.hasOwnProperty(prop)) {
                            newItem[prop] = '';
                        }
                    }
                    props.modelValue[key].push(newItem);
                    break;
                case Boolean:
                    props.modelValue[key].push(false);
                    break;
            }
        }
    }

    return {
        removeArrayItem,
        addArrayItem
    }
}


