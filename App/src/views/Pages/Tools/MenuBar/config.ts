import {
    ComponentProperty,
    ComponentStyle,
    DataTypes,
 } from '../Tools.types'
 import { Groups, Tabs } from '../Tools.constants'

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
        group: Groups.GENERAL,
        control: DataTypes.TEXT,
        value: '',
        description: 'URL of the logo image',
    },
    { 
        name: 'menu-items', 
        label: 'Menu Items', 
        group: Groups.GENERAL,
        control: DataTypes.LIST, 
        value: [], 
        description: 'Add Menu Bar Items', 
        dataModel: { label: '', link: '', badge: 0, icon: null } as menuItemsDataModel,
    },
    {
        name: 'end-text',
        label: 'End Text',
        group: Groups.GENERAL,
        control: DataTypes.TEXT,
        value: '',
        description: 'Text displayed at the end of the menu bar',
    }
]

export const menu_bar_style: ComponentStyle[] = [
    // Logo Styles
    { name: 'height', label: 'Height', group: Groups.DIMENSIONS, tab: Tabs.LOGO, control: DataTypes.TEXT, value: '44px', description: 'Sets the height of the element.' },
    { name: 'width', label: 'Width', group: Groups.DIMENSIONS, tab: Tabs.LOGO, control: DataTypes.TEXT, value: '44px', description: 'Sets the width of the element.' },
    { name: 'border-radius', label: 'Border Radius', group: Groups.DIMENSIONS, tab: Tabs.LOGO, control: DataTypes.TEXT, value: '0', description: 'Sets how round the logo.' },
    { name: 'border-width', label: 'Border Thickness', group: Groups.DIMENSIONS, tab: Tabs.LOGO, control: DataTypes.TEXT, value: '0', description: 'Sets the thickness of the border.', dependency: { name: 'border-radius', regexExp: /^-?\d+(\.\d+)?(px|cm|mm|in|pt|pc|%|em|ex|ch|rem|vw|vh|vmin|vmax|fr)$/ } },
    { name: 'border-style', label: 'Border Style', group: Groups.DIMENSIONS, tab: Tabs.LOGO, control: DataTypes.SELECT, options: ['solid', 'dashed', 'dotted'], value: 'solid', description: 'Sets the style of the border.', dependency: { name: 'border-radius', regexExp: /^-?\d+(\.\d+)?(px|cm|mm|in|pt|pc|%|em|ex|ch|rem|vw|vh|vmin|vmax|fr)$/ } },
    { name: 'border-color', label: 'Border Color', group: Groups.DIMENSIONS, tab: Tabs.LOGO, control: DataTypes.COLOR, value: 'black', description: 'Sets the color of the border.', dependency: { name: 'border-radius', regexExp: /^-?\d+(\.\d+)?(px|cm|mm|in|pt|pc|%|em|ex|ch|rem|vw|vh|vmin|vmax|fr)$/ } },
    // Text Styles
    { name: 'height', label: 'Height', group: Groups.DIMENSIONS, tab: Tabs.ITEMLABEL, control: DataTypes.TEXT, value: '100%', description: 'Sets the height of the element.' },
    { name: 'width', label: 'Width', group: Groups.DIMENSIONS, tab: Tabs.ITEMLABEL, control: DataTypes.TEXT, value: 'fit-content', description: 'Sets the width of the element.' },
    { name: 'font-size', label: 'Font Size', group: Groups.TYPOGRAPHY, tab: Tabs.ITEMLABEL, control: DataTypes.TEXT, value: '14px', description: 'Sets the size of the font.' },
    { name: 'font-weight', label: 'Font Weight', group: Groups.TYPOGRAPHY, tab: Tabs.ITEMLABEL, control: DataTypes.SELECT, options: ['normal', 'bold', 'bolder', 'lighter'], value: 'normal', description: 'Sets the weight of the font.' },
    { name: 'color', label: 'Font Color', group: Groups.TYPOGRAPHY, tab: Tabs.ITEMLABEL, control: DataTypes.COLOR, value: 'black', description: 'Sets the color of the font.' },
    { name: 'margin', label: 'Margin', group: Groups.TYPOGRAPHY, tab: Tabs.ITEMLABEL, control: DataTypes.TEXT, value: '0px', description: 'Sets the margin around the text.' },
    { name: 'padding', label: 'Padding', group: Groups.TYPOGRAPHY, tab: Tabs.ITEMLABEL, control: DataTypes.TEXT, value: '0px', description: 'Sets the padding around the text.' },
    { name: 'text-transform', label: 'Text Transform', group: Groups.TYPOGRAPHY, tab: Tabs.ITEMLABEL, control: DataTypes.SELECT, options: ['none', 'capitalize', 'uppercase', 'lowercase'], value: 'none', description: 'Controls the capitalization of text.' },
    { name: 'letter-spacing', label: 'Letter Spacing', group: Groups.TYPOGRAPHY, tab: Tabs.ITEMLABEL, control: DataTypes.TEXT, value: 'normal', description: 'Sets the spacing between letters.' },
    { name: 'text-decoration', label: 'Text Decoration', group: Groups.TYPOGRAPHY, tab: Tabs.ITEMLABEL, control: DataTypes.SELECT, options: ['none', 'underline', 'overline', 'line-through'], value: 'none', description: 'Sets the decoration of the text.' },
    { name: 'text-align', label: 'Text Align', group: Groups.TYPOGRAPHY, tab: Tabs.ITEMLABEL, control: DataTypes.SELECT, options: ['left', 'right', 'center', 'justify'], value: 'left', description: 'Sets the alignment of the text.' },
    
]