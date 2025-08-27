export const convertStyleArrayToProps = (style: Array<any>): Record<string, any> => {
    const properties: Record<string, any> = {}
    style.forEach((item) => {
        if (item.name && item.value !== "") {
            properties[item.name] = item.value
        }
    })
    return properties
}