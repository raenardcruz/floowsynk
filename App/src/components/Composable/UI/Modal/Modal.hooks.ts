import { computed } from 'vue'
import { ModalProps } from './Modal.types'

export const useModalHooks = (props: ModalProps) => {
    const showActions = computed(() => props.onOk || props.onSave)
    return { showActions }
}