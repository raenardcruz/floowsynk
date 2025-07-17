export const section_styles = [
  // Section 1: Layout & Positioning
  // Dimensions
{ name: 'width', label: 'Width', group: 'Dimensions', section: 1, control: 'text', value: '100%' },
{ name: 'height', label: 'Height', group: 'Dimensions', section: 1, control: 'text', value: '24px' },
{ name: 'min-width', label: 'Min Width', group: 'Dimensions', section: 1, control: 'text', value: '' },
{ name: 'min-height', label: 'Min Height', group: 'Dimensions', section: 1, control: 'text', value: '' },
{ name: 'max-width', label: 'Max Width', group: 'Dimensions', section: 1, control: 'text', value: '' },
{ name: 'max-height', label: 'Max Height', group: 'Dimensions', section: 1, control: 'text', value: '' },
  // Spacing
{ name: 'margin', label: 'Margin', group: 'Spacing', section: 1, control: 'text', value: '' },
{ name: 'padding', label: 'Padding', group: 'Spacing', section: 1, control: 'text', value: '8px' },
  // Position
{ name: 'position', label: 'Position', group: 'Position', section: 1, control: 'select', options: ['static', 'relative', 'absolute', 'fixed', 'sticky'], value: 'relative' },
{ name: 'top', label: 'Top', group: 'Position', section: 1, control: 'text', value: '', dependency: { property: 'position', values: ['absolute', 'fixed', 'relative', 'sticky'] } },
{ name: 'right', label: 'Right', group: 'Position', section: 1, control: 'text', value: '', dependency: { property: 'position', values: ['absolute', 'fixed', 'relative', 'sticky'] } },
{ name: 'bottom', label: 'Bottom', group: 'Position', section: 1, control: 'text', value: '', dependency: { property: 'position', values: ['absolute', 'fixed', 'relative', 'sticky'] } },
{ name: 'left', label: 'Left', group: 'Position', section: 1, control: 'text', value: '', dependency: { property: 'position', values: ['absolute', 'fixed', 'relative', 'sticky'] } },
{ name: 'z-index', label: 'Z-Index', group: 'Position', section: 1, control: 'text', value: '', dependency: { property: 'position', values: ['absolute', 'fixed', 'relative', 'sticky'] } },
  // Display
{ name: 'display', label: 'Display', group: 'Display', section: 1, control: 'select', options: ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'], value: 'flex' },
  // Overflow
{ name: 'overflow', label: 'Overflow', group: 'Overflow', section: 1, control: 'select', options: ['visible', 'hidden', 'scroll', 'auto'], value: 'visible' },

  // Section 2: Typography
  // Font
{ name: 'font-family', label: 'Font Family', group: 'Font', section: 2, control: 'text', value: '' },
{ name: 'font-size', label: 'Font Size', group: 'Font', section: 2, control: 'text', value: '' },
{ name: 'font-weight', label: 'Font Weight', group: 'Font', section: 2, control: 'select', options: ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'bolder', 'lighter'], value: 'normal' },
{ name: 'font-style', label: 'Font Style', group: 'Font', section: 2, control: 'select', options: ['normal', 'italic', 'oblique'], value: 'normal' },
{ name: 'line-height', label: 'Line Height', group: 'Font', section: 2, control: 'text', value: '' },
{ name: 'letter-spacing', label: 'Letter Spacing', group: 'Font', section: 2, control: 'text', value: '' },
{ name: 'text-transform', label: 'Text Transform', group: 'Font', section: 2, control: 'select', options: ['none', 'capitalize', 'uppercase', 'lowercase'], value: 'none' },
{ name: 'text-decoration', label: 'Text Decoration', group: 'Font', section: 2, control: 'select', options: ['none', 'underline', 'overline', 'line-through'], value: 'none' },
{ name: 'text-align', label: 'Text Align', group: 'Font', section: 2, control: 'select', options: ['left', 'right', 'center', 'justify'], value: 'left' },
{ name: 'color', label: 'Text Color', group: 'Font', section: 2, control: 'color', value: '' },
  // Shadow
{ name: 'text-shadow', label: 'Text Shadow', group: 'Shadow', section: 2, control: 'text', value: '' },

  // Section 3: Background and Borders
  // Background
{ name: 'background', label: 'Background', group: 'Background', section: 3, control: 'text', value: '' },
{ name: 'background-size', label: 'Background Size', group: 'Background', section: 3, control: 'select', options: ['auto', 'cover', 'contain'], value: 'auto' },
{ name: 'background-repeat', label: 'Background Repeat', group: 'Background', section: 3, control: 'select', options: ['repeat', 'no-repeat', 'repeat-x', 'repeat-y'], value: 'repeat' },
{ name: 'background-position', label: 'Background Position', group: 'Background', section: 3, control: 'text', value: '' },
{ name: 'background-attachment', label: 'Background Attachment', group: 'Background', section: 3, control: 'select', options: ['scroll', 'fixed', 'local'], value: 'scroll' },
  // Borders
{ name: 'border-width', label: 'Border Width', group: 'Borders', section: 3, control: 'text', value: '' },
{ name: 'border-style', label: 'Border Style', group: 'Borders', section: 3, control: 'select', options: ['none', 'solid', 'dotted', 'dashed', 'double', 'groove', 'ridge', 'inset', 'outset'], value: 'none' },
{ name: 'border-color', label: 'Border Color', group: 'Borders', section: 3, control: 'color', value: '' },
{ name: 'border-radius', label: 'Border Radius', group: 'Borders', section: 3, control: 'text', value: '' },
  // Shadow
{ name: 'box-shadow', label: 'Box Shadow', group: 'Shadow', section: 3, control: 'text', value: '' },

  // Section 4: Effects and Transforms
  // Opacity
{ name: 'opacity', label: 'Opacity', group: 'Opacity', section: 4, control: 'text', value: '' },
  // Transition
{ name: 'transition-property', label: 'Transition Property', group: 'Transition', section: 4, control: 'text', value: '' },
{ name: 'transition-duration', label: 'Transition Duration', group: 'Transition', section: 4, control: 'text', value: '' },
{ name: 'transition-timing-function', label: 'Transition Timing Function', group: 'Transition', section: 4, control: 'select', options: ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end'], value: 'ease' },
{ name: 'transition-delay', label: 'Transition Delay', group: 'Transition', section: 4, control: 'text', value: '' },
  // Transforms
{ name: 'transform', label: 'Rotate', group: 'Transforms', section: 4, control: 'text', value: '' },
{ name: 'transform', label: 'Scale', group: 'Transforms', section: 4, control: 'text', value: '' },
{ name: 'transform', label: 'Translate', group: 'Transforms', section: 4, control: 'text', value: '' },
{ name: 'transform', label: 'Skew', group: 'Transforms', section: 4, control: 'text', value: '' },
{ name: 'transform-origin', label: 'Transform Origin', group: 'Transforms', section: 4, control: 'text', value: '' },
  // Filters
{ name: 'filter-blur', label: 'Blur', group: 'Filters', section: 4, control: 'text', value: '' },
{ name: 'filter-brightness', label: 'Brightness', group: 'Filters', section: 4, control: 'text', value: '' },
{ name: 'filter-contrast', label: 'Contrast', group: 'Filters', section: 4, control: 'text', value: '' },
{ name: 'filter-grayscale', label: 'Grayscale', group: 'Filters', section: 4, control: 'text', value: '' },
{ name: 'filter-invert', label: 'Invert', group: 'Filters', section: 4, control: 'text', value: '' },
{ name: 'filter-saturate', label: 'Saturate', group: 'Filters', section: 4, control: 'text', value: '' },
{ name: 'filter-sepia', label: 'Sepia', group: 'Filters', section: 4, control: 'text', value: '' },
]