export type ModalProps = {
    title: string;
    caption: string;
    visible: boolean;
    fontcolor?: string | '#222';
    bgcolor?: string | '#E6E5E5';
    onOk?: (payload: MouseEvent) => void;
    onSave?: (payload: MouseEvent) => void;
}