import type { DefineComponent } from 'vue'

export interface SelectOption {
    label: string;
    value: string;
    customComponent?: DefineComponent;
}

export interface EditorConfig {
    variables: any[];
    target: string;
}
