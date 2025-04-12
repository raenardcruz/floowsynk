import { useSidebarNodeStore } from '../Workflow.Sidebar.Node.hooks'
import { SidebarNodeProps } from '../Workflow.Sidebar.Node.types'
import { EMIT_MODEL } from './Workflow.Sidebar.Node.Fields.constants'
import { NodeDataArray, ArrayDataType } from 'proto/floowsynk_pb'

const { modalStates } = useSidebarNodeStore();

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
        let listObj = props.modelValue[key] as NodeDataArray.AsObject;
        switch (listObj.type) {
            case ArrayDataType.STRING:
                listObj.stringitemsList?.splice(index, 1);
                break;
            case ArrayDataType.INT:
                listObj.intitemsList?.splice(index, 1);
                break;
            case ArrayDataType.BOOL:
                listObj.boolitemsList?.splice(index, 1);
                break;
            case ArrayDataType.KEYVALUE:
                listObj.keyvalueitemsList?.splice(index, 1);
                break;
            default:
                throw new Error('Invalid ArrayDataType');
        }
    }
    const addArrayItem = function (key: string) {
        let listObj = props.modelValue[key] as NodeDataArray.AsObject;
        switch (listObj.type) {
            case ArrayDataType.STRING:
                if (!listObj.stringitemsList)
                    listObj.stringitemsList = [];
                listObj.stringitemsList.push('');
                break;
            case ArrayDataType.INT:
                if (!listObj.intitemsList)
                    listObj.intitemsList = [];
                listObj.intitemsList.push(0);
                break;
            case ArrayDataType.BOOL:
                if (!listObj.boolitemsList)
                    listObj.boolitemsList = [];
                listObj.boolitemsList.push(true);
                break;
            case ArrayDataType.KEYVALUE:
                if (!listObj.keyvalueitemsList)
                    listObj.keyvalueitemsList = [];
                listObj.keyvalueitemsList.push({ key: '', value: '' });
                break;
            default:
                throw new Error('Invalid ArrayDataType');
        }
    }

    return {
        removeArrayItem,
        addArrayItem
    }
}


