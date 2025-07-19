import { section_styles } from '@/components/Page/Tools/Section.config'
import { heading_styles } from '@/components/Page/Tools/Heading.config'

export const getComponentStyles = (componentName: string): Array<any> => {
    switch (componentName) {
        case 'section':
            return section_styles
        case 'heading':
            return heading_styles
        default:
            return []
    }
}

export const convertStyleArrayToProps = (style: Array<any>): Record<string, any> => {
    const properties: Record<string, any> = {}
    style.forEach((item) => {
        if (item.name && item.value !== "") {
            properties[item.name] = item.value
        }
    })
    return properties
}