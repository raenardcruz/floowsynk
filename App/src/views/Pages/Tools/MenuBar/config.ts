import { ComponentProperty, DataTypes } from '../Tools.types'

export interface menuItemsDataModel {
    label: string
    link: string
    badge: number | null
    icon: string | null
}

export enum MenuBarStyleSections {
    DEFAULT = 'Root',
    LOGO = 'Logo',
    ITEMLABEL = 'Item Labels',
    ITEMICON = 'Item Icons',
}

export enum MenuBarPropertiesSections {
    GENERAL = 'General',
}

export const menu_bar_properties: ComponentProperty[] = [
    {
        name: 'logo',
        label: 'Logo',
        group: 'General',
        section: MenuBarPropertiesSections.GENERAL,
        control: DataTypes.TEXT,
        value: '',
        description: 'URL of the logo image',
    },
    { 
        name: 'menu-items', 
        label: 'Menu Items', 
        group: 'General', 
        section: MenuBarPropertiesSections.GENERAL, 
        control: DataTypes.LIST, 
        value: [], 
        description: 'Add Menu Bar Items', 
        dataModel: { label: '', link: '', badge: 0, icon: null } as menuItemsDataModel,
    },
    {
        name: 'end-text',
        label: 'End Text',
        group: 'General',
        section: MenuBarPropertiesSections.GENERAL,
        control: DataTypes.TEXT,
        value: '',
        description: 'Text displayed at the end of the menu bar',
    }
]

export const menu_bar_style: ComponentProperty[] = [
    { name: 'width', label: 'Width', group: 'Dimensions', section: MenuBarStyleSections.LOGO, control: DataTypes.TEXT, value: '100%', description: 'Sets the width of the element.' },
    { name: 'width', label: 'Width', group: 'Dimensions', section: MenuBarStyleSections.ITEMICON, control: DataTypes.TEXT, value: '100%', description: 'Sets the width of the element.' },
]