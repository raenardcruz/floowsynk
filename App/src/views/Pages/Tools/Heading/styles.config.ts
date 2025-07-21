export const heading_styles = [
    { name: 'font-family', label: 'Font Family', group: 'Font', section: 2, control: 'text', value: '', placeholder: 'e.g. Arial, sans-serif', description: 'Sets the font family for the text.' },
    { name: 'font-size', label: 'Font Size', group: 'Font', section: 2, control: 'text', value: '20px', placeholder: 'e.g. 16px, 1.2em', description: 'Sets the size of the text.' },
    { name: 'font-weight', label: 'Font Weight', group: 'Font', section: 2, control: 'select', options: ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'bolder', 'lighter'], value: 'normal', description: 'Sets the thickness or boldness of the text.' },
    { name: 'font-style', label: 'Font Style', group: 'Font', section: 2, control: 'select', options: ['normal', 'italic', 'oblique'], value: 'normal', description: 'Sets the style of the text, such as italic or normal.' },
    { name: 'line-height', label: 'Line Height', group: 'Font', section: 2, control: 'text', value: '', placeholder: 'e.g. 1.5', description: 'Sets the height of each line of text.' },
    { name: 'letter-spacing', label: 'Letter Spacing', group: 'Font', section: 2, control: 'text', value: '', placeholder: 'e.g. 0.5px', description: 'Sets the space between characters in the text.' },
    { name: 'text-transform', label: 'Text Transform', group: 'Font', section: 2, control: 'select', options: ['none', 'capitalize', 'uppercase', 'lowercase'], value: 'none', description: 'Controls the capitalization of the text.' },
    { name: 'text-decoration', label: 'Text Decoration', group: 'Font', section: 2, control: 'select', options: ['none', 'underline', 'overline', 'line-through'], value: 'none', description: 'Adds decoration to the text, such as underline.' },
    { name: 'text-align', label: 'Text Align', group: 'Font', section: 2, control: 'select', options: ['left', 'right', 'center', 'justify'], value: 'left', description: 'Sets the horizontal alignment of the text.' },
    { name: 'color', label: 'Text Color', group: 'Font', section: 2, control: 'color', value: '', placeholder: 'e.g. #333333', description: 'Sets the color of the text.' },
]