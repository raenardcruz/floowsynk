import { EMIT_MODEL } from './Workflow.Sidebar.Node.Fields.constants'

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


