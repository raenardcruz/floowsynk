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

export interface ComponentProperty {
    name: string
    label: string
    group: string
    section: number | string
    control: DataTypes,
    value: any,
    options?: Array<any> | null,
    description?: string,
    dataModel?: any | null
}