interface LongVowelRule {
    kana: string[]
    macron: string
    spellings: [string, ...string[]]
}

const LONG_VOWEL_RULES: LongVowelRule[] = [
    { kana: ['ああ'], macron: 'ā', spellings: ['aa'] },
    { kana: ['いい'], macron: 'ī', spellings: ['ii'] },
    { kana: ['うう'], macron: 'ū', spellings: ['uu'] },
    { kana: ['ええ'], macron: 'ē', spellings: ['ee'] },
    { kana: ['おう', 'おお'], macron: 'ō', spellings: ['ou', 'oo'] },
]

export function normalizeRomaji(value: string): string {
    return value.normalize('NFKC').toLowerCase().trim()
}

function addReplacements(aliases: Set<string>, source: string, replacements: string[]): void {
    for (const alias of aliases) {
        if (!alias.includes(source)) continue
        for (const replacement of replacements) {
            aliases.add(alias.split(source).join(replacement))
        }
    }
}

function getRomajiAliases(expected: string, furigana: string): Set<string> {
    const aliases = new Set([normalizeRomaji(expected)])

    for (const rule of LONG_VOWEL_RULES) {
        addReplacements(aliases, rule.macron, rule.spellings)

        if (rule.kana.some((sequence) => furigana.includes(sequence))) {
            addReplacements(aliases, rule.spellings[0], [rule.macron, ...rule.spellings])
            const secondarySpelling = rule.spellings[1]
            if (secondarySpelling) {
                addReplacements(aliases, secondarySpelling, [rule.macron, ...rule.spellings])
            }
        }
    }

    return aliases
}

export function isRomajiCorrect(response: string, expected: string, furigana = ''): boolean {
    const normalizedResponse = normalizeRomaji(response)
    return getRomajiAliases(expected, furigana).has(normalizedResponse)
}
