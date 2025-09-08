import {
    ComponentProperty,
    ComponentStyle,
    DataTypes,
 } from '../Tools.types'
 import { Groups, Tabs } from '../Tools.constants'

 export const accordion_styles: ComponentStyle[] = [
    { name: 'width', label: 'Width', group: Groups.DIMENSIONS, tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '100%', description: 'Sets the width of the element.' },
    { name: 'background', label: 'Background', group: 'Background', tab: Tabs.DEFAULT, control: DataTypes.COLOR, value: '', placeholder: 'e.g. #ffffff', description: 'Sets the background color of the element.' },
 ]