import { ComponentProperty, DataTypes } from '../Tools.types'

export interface menuItemsDataModel {
    label: string
    link: string
    badge: number | null
    icon: string | null
}

export const menu_bar_properties: ComponentProperty[] = [
    {
        name: 'logo',
        label: 'Logo',
        group: 'General',
        section: 1,
        control: DataTypes.TEXT,
        value: '',
        description: 'URL of the logo image',
    },
    { 
        name: 'menu-items', 
        label: 'Menu Items', 
        group: 'General', 
        section: 1, 
        control: DataTypes.LIST, 
        value: [], 
        description: 'Add Menu Bar Items', 
        dataModel: { label: '', link: '', badge: null, icon: null } as menuItemsDataModel,
    },
    {
        name: 'end-text',
        label: 'End Text',
        group: 'General',
        section: 1,
        control: DataTypes.TEXT,
        value: '',
        description: 'Text displayed at the end of the menu bar',
    }
]