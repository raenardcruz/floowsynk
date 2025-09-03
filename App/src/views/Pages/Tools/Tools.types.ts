export enum DataTypes {
    LIST = 'List',
    TEXT = 'Text',
    NUMBER = 'Number',
    BOOLEAN = 'Boolean',
    COLOR = 'Color',
    SELECT = 'Select',
    MULTISELECT = 'MultiSelect',
    ICON = 'Icon'
}

export interface BaseComponent {
    name: string
    label: string
    group: string
    control: DataTypes,
    value: any,
    options?: Array<any> | null,
    description?: string,
    placeholder?: string,
    dependency?: { name: string, regexExp: RegExp } | null,
}

export interface ComponentProperty extends BaseComponent {
    dataModel?: any | null
}

export interface ComponentStyle extends BaseComponent {
    tab: string,
}