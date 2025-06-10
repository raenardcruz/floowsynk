export const EMIT_VISIBLE = 'update:visible'

export const BaseSidebarProps = {
    width: {
        type: String,
        default: '300px',
    },
    position: {
        type: String,
        default: 'left',
    },
}

export const CollapsibleSidebarProps = {
    ...BaseSidebarProps,
    closeOnClickOutside: {
        type: Boolean,
        default: true,
    },
    closeOnEscape: {
        type: Boolean,
        default: true,
    },
}