import { computed } from "vue";
import { SidebarProps } from './Sidebar.types';
import { EMIT_VISIBLE } from './Sidebar.constants';

export const useSidebarHooks = (props: SidebarProps, emit: (event: "update:visible", ...args: any[]) => void) => {
    const visible = computed({
        get: () => props.visible,
        set: (value: boolean) => emit(EMIT_VISIBLE, value)
    });
    
    return {
        visible
    }
}

