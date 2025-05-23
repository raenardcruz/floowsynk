export const generateUUID = (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16,
            v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export const toSentenceCase = function (str: string): string {
    if (!str) return str;
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2') // insert space between camelCase words
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // insert space between PascalCase words
        .replace(/^./, (char) => char.toUpperCase()); // capitalize the first letter
}