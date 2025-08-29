export type ActionTab = {
    id: number,
    label: string,
    icon: string,
}
export const ACTION_TABS: ActionTab[] = [
    {
        id: 1,
        label: 'Components',
        icon: 'src/components/Icons/puzzle.svg',
    },
    {
        id: 2,
        label: 'Styles',
        icon: 'src/components/Icons/painting.svg'
    },
    {
        id: 3,
        label: 'Layout',
        icon: 'src/components/Icons/org.svg'
    }
]