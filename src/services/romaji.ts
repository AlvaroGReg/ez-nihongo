/**
 * Keeps romanji matching forgiving for presentation differences while leaving
 * phonetic alternatives (for example o/ou) distinct.
 */
export function normalizeRomaji(value: string): string {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
}

export function isRomajiCorrect(response: string, expected: string): boolean {
    return normalizeRomaji(response) === normalizeRomaji(expected)
}
