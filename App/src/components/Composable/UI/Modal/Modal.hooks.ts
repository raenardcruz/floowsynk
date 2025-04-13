import { computed } from 'vue'
import { ModalProps } from './Modal.types'
import { EMMIT_VISIBLE } from './Modal.contants'

export const useModalHooks = (props: ModalProps, emit: (event: "update:visible", ...args: any[]) => void) => {
    const visible = computed({
        get: () => props.visible,
        set: (value: boolean) => emit(EMMIT_VISIBLE, value)
    })
    const showActions = computed(() => props.onOk || props.onSave)
    return { visible, showActions }
}