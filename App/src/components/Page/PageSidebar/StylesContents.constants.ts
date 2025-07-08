export const SECTIONS = [
  { id: 1, name: 'Layout & Positioning', icon: 'src/components/Icons/settings.svg' },
  { id: 2, name: 'Typography', icon: 'src/components/Icons/painting.svg' },
  { id: 3, name: 'Background & Borders', icon: 'src/components/Icons/screen.svg' },
  { id: 4, name: 'Effects & Transforms', icon: 'src/components/Icons/workflow.svg' },
  { id: 5, name: 'Custom', icon: 'src/components/Icons/add.svg' },
];

export const PROPERTIES = [
  // Section 1: Layout & Positioning
  // Dimensions
  { name: 'width', label: 'Width', group: 'Dimensions', section: 1, control: 'text' },
  { name: 'height', label: 'Height', group: 'Dimensions', section: 1, control: 'text' },
  { name: 'min-width', label: 'Min Width', group: 'Dimensions', section: 1, control: 'text' },
  { name: 'min-height', label: 'Min Height', group: 'Dimensions', section: 1, control: 'text' },
  { name: 'max-width', label: 'Max Width', group: 'Dimensions', section: 1, control: 'text' },
  { name: 'max-height', label: 'Max Height', group: 'Dimensions', section: 1, control: 'text' },
  // Spacing
  { name: 'margin', label: 'Margin', group: 'Spacing', section: 1, control: 'text' },
  { name: 'padding', label: 'Padding', group: 'Spacing', section: 1, control: 'text' },
  // Position
  { name: 'position', label: 'Position', group: 'Position', section: 1, control: 'select', options: ['static', 'relative', 'absolute', 'fixed', 'sticky'] },
  { name: 'top', label: 'Top', group: 'Position', section: 1, control: 'text' },
  { name: 'right', label: 'Right', group: 'Position', section: 1, control: 'text' },
  { name: 'bottom', label: 'Bottom', group: 'Position', section: 1, control: 'text' },
  { name: 'left', label: 'Left', group: 'Position', section: 1, control: 'text' },
  { name: 'z-index', label: 'Z-Index', group: 'Position', section: 1, control: 'text' },
  // Display
  { name: 'display', label: 'Display', group: 'Display', section: 1, control: 'select', options: ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'] },
  // Overflow
  { name: 'overflow', label: 'Overflow', group: 'Overflow', section: 1, control: 'select', options: ['visible', 'hidden', 'scroll', 'auto'] },

  // Section 2: Typography
  // Font
  { name: 'font-family', label: 'Font Family', group: 'Font', section: 2, control: 'text' },
  { name: 'font-size', label: 'Font Size', group: 'Font', section: 2, control: 'text' },
  { name: 'font-weight', label: 'Font Weight', group: 'Font', section: 2, control: 'select', options: ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'bolder', 'lighter'] },
  { name: 'font-style', label: 'Font Style', group: 'Font', section: 2, control: 'select', options: ['normal', 'italic', 'oblique'] },
  { name: 'line-height', label: 'Line Height', group: 'Font', section: 2, control: 'text' },
  { name: 'letter-spacing', label: 'Letter Spacing', group: 'Font', section: 2, control: 'text' },
  { name: 'text-transform', label: 'Text Transform', group: 'Font', section: 2, control: 'select', options: ['none', 'capitalize', 'uppercase', 'lowercase'] },
  { name: 'text-decoration', label: 'Text Decoration', group: 'Font', section: 2, control: 'select', options: ['none', 'underline', 'overline', 'line-through'] },
  { name: 'text-align', label: 'Text Align', group: 'Font', section: 2, control: 'select', options: ['left', 'right', 'center', 'justify'] },
  { name: 'color', label: 'Text Color', group: 'Font', section: 2, control: 'color' },
  // Shadow
  { name: 'text-shadow', label: 'Text Shadow', group: 'Shadow', section: 2, control: 'text' },

  // Section 3: Background and Borders
  // Background
  { name: 'background', label: 'Background', group: 'Background', section: 3, control: 'text' },
  { name: 'background-size', label: 'Background Size', group: 'Background', section: 3, control: 'select', options: ['auto', 'cover', 'contain'] },
  { name: 'background-repeat', label: 'Background Repeat', group: 'Background', section: 3, control: 'select', options: ['repeat', 'no-repeat', 'repeat-x', 'repeat-y'] },
  { name: 'background-position', label: 'Background Position', group: 'Background', section: 3, control: 'text' },
  { name: 'background-attachment', label: 'Background Attachment', group: 'Background', section: 3, control: 'select', options: ['scroll', 'fixed', 'local'] },
  // Borders
  { name: 'border-width', label: 'Border Width', group: 'Borders', section: 3, control: 'text' },
  { name: 'border-style', label: 'Border Style', group: 'Borders', section: 3, control: 'select', options: ['none', 'solid', 'dotted', 'dashed', 'double', 'groove', 'ridge', 'inset', 'outset'] },
  { name: 'border-color', label: 'Border Color', group: 'Borders', section: 3, control: 'color' },
  { name: 'border-radius', label: 'Border Radius', group: 'Borders', section: 3, control: 'text' },
  // Shadow
  { name: 'box-shadow', label: 'Box Shadow', group: 'Shadow', section: 3, control: 'text' },

  // Section 4: Effects and Transforms
  // Opacity
  { name: 'opacity', label: 'Opacity', group: 'Opacity', section: 4, control: 'text' },
  // Transition
  { name: 'transition-property', label: 'Transition Property', group: 'Transition', section: 4, control: 'text' },
  { name: 'transition-duration', label: 'Transition Duration', group: 'Transition', section: 4, control: 'text' },
  { name: 'transition-timing-function', label: 'Transition Timing Function', group: 'Transition', section: 4, control: 'select', options: ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end'] },
  { name: 'transition-delay', label: 'Transition Delay', group: 'Transition', section: 4, control: 'text' },
  // Transforms
  { name: 'transform', label: 'Rotate', group: 'Transforms', section: 4, control: 'text' },
  { name: 'transform', label: 'Scale', group: 'Transforms', section: 4, control: 'text' },
  { name: 'transform', label: 'Translate', group: 'Transforms', section: 4, control: 'text' },
  { name: 'transform', label: 'Skew', group: 'Transforms', section: 4, control: 'text' },
  { name: 'transform-origin', label: 'Transform Origin', group: 'Transforms', section: 4, control: 'text' },
  // Filters
  { name: 'filter-blur', label: 'Blur', group: 'Filters', section: 4, control: 'text' },
  { name: 'filter-brightness', label: 'Brightness', group: 'Filters', section: 4, control: 'text' },
  { name: 'filter-contrast', label: 'Contrast', group: 'Filters', section: 4, control: 'text' },
  { name: 'filter-grayscale', label: 'Grayscale', group: 'Filters', section: 4, control: 'text' },
  { name: 'filter-invert', label: 'Invert', group: 'Filters', section: 4, control: 'text' },
  { name: 'filter-saturate', label: 'Saturate', group: 'Filters', section: 4, control: 'text' },
  { name: 'filter-sepia', label: 'Sepia', group: 'Filters', section: 4, control: 'text' },
];