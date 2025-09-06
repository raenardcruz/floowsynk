import {
  ComponentStyle,
  DataTypes,
} from '../Tools.types'
import { Groups, Tabs } from '../Tools.constants'

export const section_styles: ComponentStyle[] = [
  // Section 1: Layout & Positioning
  // Dimensions
  { name: 'width', label: 'Width', group: Groups.DIMENSIONS, tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '100%', placeholder: 'e.g. 100%, 400px', description: 'Sets the width of the element.' },
  { name: 'height', label: 'Height', group: Groups.DIMENSIONS, tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '60px', placeholder: 'e.g. 60px, 10vh', description: 'Sets the height of the element.' },
  { name: 'min-width', label: 'Min Width', group: Groups.DIMENSIONS, tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 200px', description: 'Sets the minimum width the element can be.' },
  { name: 'min-height', label: 'Min Height', group: Groups.DIMENSIONS, tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 50px', description: 'Sets the minimum height the element can be.' },
  { name: 'max-width', label: 'Max Width', group: Groups.DIMENSIONS, tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 1000px', description: 'Sets the maximum width the element can be.' },
  { name: 'max-height', label: 'Max Height', group: Groups.DIMENSIONS, tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 500px', description: 'Sets the maximum height the element can be.' },
  // Spacing
  { name: 'margin', label: 'Margin', group: 'Spacing', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 8px 16px', description: 'Sets the space outside the element.' },
  { name: 'padding', label: 'Padding', group: 'Spacing', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '8px', placeholder: 'e.g. 8px 16px', description: 'Sets the space inside the element, between the content and the border.' },
  // Position
  { name: 'position', label: 'Position', group: 'Position', tab: Tabs.DEFAULT, control: DataTypes.SELECT, options: ['static', 'relative', 'absolute', 'fixed', 'sticky'], value: 'relative', description: 'Specifies how the element is positioned in the document.' },
  { name: 'top', label: 'Top', group: 'Position', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 0, 10px', dependency: { name: 'position', regexExp: /^(absolute|fixed|relative|sticky)$/ }, description: 'Moves the element from the top edge of its containing block.' },
  { name: 'right', label: 'Right', group: 'Position', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 0, 10px', dependency: { name: 'position', regexExp: /^(absolute|fixed|relative|sticky)$/ }, description: 'Moves the element from the right edge of its containing block.' },
  { name: 'bottom', label: 'Bottom', group: 'Position', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 0, 10px', dependency: { name: 'position', regexExp: /^(absolute|fixed|relative|sticky)$/ }, description: 'Moves the element from the bottom edge of its containing block.' },
  { name: 'left', label: 'Left', group: 'Position', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 0, 10px', dependency: { name: 'position', regexExp: /^(absolute|fixed|relative|sticky)$/ }, description: 'Moves the element from the left edge of its containing block.' },
  { name: 'z-index', label: 'Z-Index', group: 'Position', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 10', dependency: { name: 'position', regexExp: /^(absolute|fixed|relative|sticky)$/ }, description: 'Controls the stack order of the element.' },
  // Display
  { name: 'display', label: 'Display', group: 'Display', tab: Tabs.DEFAULT, control: DataTypes.SELECT, options: ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'], value: 'flex', description: 'Specifies how the element is displayed.' },
  {
    name: 'flex-direction',
    label: 'Flex Direction',
    group: 'Display',
    tab: Tabs.DEFAULT,
    control: DataTypes.SELECT,
    options: [
      'row',
      'row-reverse',
      'column',
      'column-reverse',
    ],
    value: 'row',
    description: 'Specifies the direction of the flexible items.',
    dependency: { name: 'display', regexExp: /^(flex|inline-flex)$/ }
  },
  {
    name: 'flex-wrap',
    label: 'Flex Wrap',
    group: 'Display',
    tab: Tabs.DEFAULT,
    control: DataTypes.SELECT,
    options: [
      'nowrap',
      'wrap',
      'wrap-reverse',
    ],
    value: 'nowrap',
    description: 'Specifies whether the flexible items should wrap or not.',
    dependency: { name: 'display', regexExp: /^(flex|inline-flex)$/ }
  },
  {
    name: 'justify-content',
    label: 'Justify Content',
    group: 'Display',
    tab: Tabs.DEFAULT,
    control: DataTypes.SELECT,
    options: [
      'flex-start',
      'flex-end',
      'center',
      'space-between',
      'space-around',
      'space-evenly',
    ],
    value: 'flex-start',
    description: 'Aligns the flexible container\'s items when the items do not use all available space on the main-axis.',
    dependency: { name: 'display', regexExp: /^(flex|inline-flex)$/ }
  },
  {
    name: 'align-items',
    label: 'Align Items',
    group: 'Display',
    tab: Tabs.DEFAULT,
    control: DataTypes.SELECT,
    options: [
      'stretch',
      'flex-start',
      'flex-end',
      'center',
      'baseline',
    ],
    value: 'stretch',
    description: 'Aligns flex items of the current flex line the same way as justify-content but in the perpendicular direction.',
    dependency: { name: 'display', regexExp: /^(flex|inline-flex)$/ }
  },
  {
    name: 'align-content',
    label: 'Align Content',
    group: 'Display',
    tab: Tabs.DEFAULT,
    control: DataTypes.SELECT,
    options: [
      'flex-start',
      'flex-end',
      'center',
      'space-between',
      'space-around',
      'stretch',
    ],
    value: 'stretch',
    description: 'Aligns a flex container\'s lines within when there is extra space in the cross-axis, similar to how justify-content aligns individual items within the main-axis.',
    dependency: { name: 'display', regexExp: /^(flex|inline-flex)$/ }
  },
  {
    name: 'flex-grow',
    label: 'Flex Grow',
    group: 'Display',
    tab: Tabs.DEFAULT,
    control: DataTypes.TEXT,
    value: '0',
    placeholder: 'e.g. 0',
    description: 'Sets the flex grow factor of a flexible item.',
    dependency: { name: 'display', regexExp: /^(flex|inline-flex)$/ }
  },
  {
    name: 'flex-shrink',
    label: 'Flex Shrink',
    group: 'Display',
    tab: Tabs.DEFAULT,
    control: DataTypes.TEXT,
    value: '1',
    placeholder: 'e.g. 1',
    description: 'Sets the flex shrink factor of a flexible item.',
    dependency: { name: 'display', regexExp: /^(flex|inline-flex)$/ }
  },
  {
    name: 'flex-basis',
    label: 'Flex Basis',
    group: 'Display',
    tab: Tabs.DEFAULT,
    control: DataTypes.TEXT,
    value: 'auto',
    placeholder: 'e.g. auto',
    description: 'Sets the initial main size of a flexible item.',
    dependency: { name: 'display', regexExp: /^(flex|inline-flex)$/ }
  },
  {
    name: 'align-self',
    label: 'Align Self',
    group: 'Display',
    tab: Tabs.DEFAULT,
    control: DataTypes.SELECT,
    options: [
      'auto',
      'flex-start',
      'flex-end',
      'center',
      'baseline',
      'stretch',
    ],
    value: 'auto',
    description: 'Allows the default alignment (or the one specified by align-items) to be overridden for individual flex items.',
    dependency: { name: 'display', regexExp: /^(flex|inline-flex)$/ }
  },
  // Overflow
  { name: 'overflow', label: 'Overflow', group: 'Overflow', tab: Tabs.DEFAULT, control: DataTypes.SELECT, options: ['visible', 'hidden', 'scroll', 'auto'], value: 'visible', description: 'Controls what happens when content overflows the element.' },

  // Section 2: Typography
  // Font
  { name: 'font-family', label: 'Font Family', group: 'Font', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. Arial, sans-serif', description: 'Sets the font family for the text.' },
  { name: 'font-size', label: 'Font Size', group: 'Font', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 16px, 1.2em', description: 'Sets the size of the text.' },
  { name: 'font-weight', label: 'Font Weight', group: 'Font', tab: Tabs.DEFAULT, control: DataTypes.SELECT, options: ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'bolder', 'lighter'], value: 'normal', description: 'Sets the thickness or boldness of the text.' },
  { name: 'font-style', label: 'Font Style', group: 'Font', tab: Tabs.DEFAULT, control: DataTypes.SELECT, options: ['normal', 'italic', 'oblique'], value: 'normal', description: 'Sets the style of the text, such as italic or normal.' },
  { name: 'line-height', label: 'Line Height', group: 'Font', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 1.5', description: 'Sets the height of each line of text.' },
  { name: 'letter-spacing', label: 'Letter Spacing', group: 'Font', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 0.5px', description: 'Sets the space between characters in the text.' },
  { name: 'text-transform', label: 'Text Transform', group: 'Font', tab: Tabs.DEFAULT, control: DataTypes.SELECT, options: ['none', 'capitalize', 'uppercase', 'lowercase'], value: 'none', description: 'Controls the capitalization of the text.' },
  { name: 'text-decoration', label: 'Text Decoration', group: 'Font', tab: Tabs.DEFAULT, control: DataTypes.SELECT, options: ['none', 'underline', 'overline', 'line-through'], value: 'none', description: 'Adds decoration to the text, such as underline.' },
  { name: 'text-align', label: 'Text Align', group: 'Font', tab: Tabs.DEFAULT, control: DataTypes.SELECT, options: ['left', 'right', 'center', 'justify'], value: 'left', description: 'Sets the horizontal alignment of the text.' },
  { name: 'color', label: 'Text Color', group: 'Font', tab: Tabs.DEFAULT, control: DataTypes.COLOR, value: '', placeholder: 'e.g. #333333', description: 'Sets the color of the text.' },
  // Shadow
  { name: 'text-shadow', label: 'Text Shadow', group: 'Shadow', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 1px 1px 2px #000', description: 'Adds a shadow effect to the text.' },

  // Section 3: Background and Borders
  // Background
  { name: 'background', label: 'Background', group: 'Background', tab: Tabs.DEFAULT, control: DataTypes.COLOR, value: '', placeholder: 'e.g. #ffffff', description: 'Sets the background color of the element.' },
  { name: 'background-size', label: 'Background Size', group: 'Background', tab: Tabs.DEFAULT, control: DataTypes.SELECT, options: ['auto', 'cover', 'contain'], value: 'auto', description: 'Specifies the size of the background image.' },
  { name: 'background-repeat', label: 'Background Repeat', group: 'Background', tab: Tabs.DEFAULT, control: DataTypes.SELECT, options: ['repeat', 'no-repeat', 'repeat-x', 'repeat-y'], value: 'repeat', description: 'Controls if/how the background image repeats.' },
  { name: 'background-position', label: 'Background Position', group: 'Background', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. center, top left', description: 'Sets the starting position of the background image.' },
  { name: 'background-attachment', label: 'Background Attachment', group: 'Background', tab: Tabs.DEFAULT, control: DataTypes.SELECT, options: ['scroll', 'fixed', 'local'], value: 'scroll', description: 'Sets whether the background scrolls with the page.' },
  // Borders
  { name: 'border-width', label: 'Border Width', group: 'Borders', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 1px', description: 'Sets the width of the border.' },
  { name: 'border-style', label: 'Border Style', group: 'Borders', tab: Tabs.DEFAULT, control: DataTypes.SELECT, options: ['none', 'solid', 'dotted', 'dashed', 'double', 'groove', 'ridge', 'inset', 'outset'], value: 'none', description: 'Sets the style of the border.' },
  { name: 'border-color', label: 'Border Color', group: 'Borders', tab: Tabs.DEFAULT, control: DataTypes.COLOR, value: '', placeholder: 'e.g. #cccccc', description: 'Sets the color of the border.' },
  { name: 'border-radius', label: 'Border Radius', group: 'Borders', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 8px', description: 'Rounds the corners of the border.' },
  // Shadow
  { name: 'box-shadow', label: 'Box Shadow', group: 'Shadow', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 0 2px 8px #00000022', description: 'Adds a shadow effect to the element.' },

  // Section 4: Effects and Transforms
  // Opacity
  { name: 'opacity', label: 'Opacity', group: 'Opacity', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 0.5', description: 'Sets the transparency level of the element.' },
  // Transition
  { name: 'transition-property', label: 'Transition Property', group: 'Transition', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. all, opacity', description: 'Specifies the CSS property to which the transition is applied.' },
  { name: 'transition-duration', label: 'Transition Duration', group: 'Transition', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 0.3s', description: 'Sets how long the transition takes.' },
  { name: 'transition-timing-function', label: 'Transition Timing Function', group: 'Transition', tab: Tabs.DEFAULT, control: DataTypes.SELECT, options: ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end'], value: 'ease', description: 'Sets the speed curve of the transition.' },
  { name: 'transition-delay', label: 'Transition Delay', group: 'Transition', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 0.1s', description: 'Sets the delay before the transition starts.' },
  // Transforms
  { name: 'transform', label: 'Rotate', group: 'Transforms', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. rotate(45deg)', description: 'Rotates the element.' },
  { name: 'transform', label: 'Scale', group: 'Transforms', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. scale(1.2)', description: 'Scales (resizes) the element.' },
  { name: 'transform', label: 'Translate', group: 'Transforms', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. translateX(10px)', description: 'Moves (translates) the element.' },
  { name: 'transform', label: 'Skew', group: 'Transforms', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. skew(10deg)', description: 'Skews (distorts) the element.' },
  { name: 'transform-origin', label: 'Transform Origin', group: 'Transforms', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. center, top left', description: 'Sets the point around which a transformation is applied.' },
  // Filters
  { name: 'filter-blur', label: 'Blur', group: 'Filters', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 4px', description: 'Applies a blur effect to the element.' },
  { name: 'filter-brightness', label: 'Brightness', group: 'Filters', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 120%', description: 'Adjusts the brightness of the element.' },
  { name: 'filter-contrast', label: 'Contrast', group: 'Filters', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 150%', description: 'Adjusts the contrast of the element.' },
  { name: 'filter-grayscale', label: 'Grayscale', group: 'Filters', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 80%', description: 'Converts the element to grayscale.' },
  { name: 'filter-invert', label: 'Invert', group: 'Filters', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 100%', description: 'Inverts the colors of the element.' },
  { name: 'filter-saturate', label: 'Saturate', group: 'Filters', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 200%', description: 'Adjusts the color saturation of the element.' },
  { name: 'filter-sepia', label: 'Sepia', group: 'Filters', tab: Tabs.DEFAULT, control: DataTypes.TEXT, value: '', placeholder: 'e.g. 60%', description: 'Applies a sepia tone to the element.' },
]