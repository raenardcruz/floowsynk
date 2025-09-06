export const convertStyleArrayToProps = (
    style: Array<{ tab: string; name: string; value: any }>
): Record<string, Record<string, any>> => {
    const tabProperties: Record<string, Record<string, any>> = {}
    style.forEach((item) => {
        if (item.tab && item.name && item.value !== "") {
            if (!tabProperties[item.tab]) {
                tabProperties[item.tab] = {}
            }
            tabProperties[item.tab][item.name] = item.value
        }
    })
    return tabProperties
}