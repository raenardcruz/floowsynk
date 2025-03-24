export type ModalProps = {
    title: string;
    caption: string;
    visible: boolean;
    fontcolor?: string | 'var(--grey-2)';
    bgcolor?: string | 'var(--grey-3)';
    onOk?: (payload: MouseEvent) => void;
    onSave?: (payload: MouseEvent) => void;
}