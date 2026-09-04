import type { CatalogArtifact, CatalogManifest, CatalogUnit, ContentItem, ExerciseDefinition, Locale } from '@/types/domain'

export type CatalogErrorCode = 'catalogAssetError' | 'catalogSchemaError' | 'catalogCompatibilityError' | 'catalogLicenseError' | 'catalogContentError'

export class CatalogError extends Error {
    constructor(public readonly code: CatalogErrorCode, message = code) {
        super(message)
        this.name = 'CatalogError'
    }
}

const CLIENT_VERSION = '0.3.0'
const SUPPORTED_SCHEMA = 1

function record(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function versionParts(value: string): number[] {
    return value.replace(/^v/, '').split('.').map((part) => Number(part))
}

function compatible(minimum: string): boolean {
    const required = versionParts(minimum)
    const client = versionParts(CLIENT_VERSION)
    for (let index = 0; index < Math.max(required.length, client.length); index += 1) {
        const requiredPart = required[index] ?? 0
        const clientPart = client[index] ?? 0
        if (clientPart > requiredPart) return true
        if (clientPart < requiredPart) return false
    }
    return true
}

export function validateManifest(value: unknown): CatalogManifest {
    if (!record(value) || value.schemaVersion !== SUPPORTED_SCHEMA || typeof value.catalogVersion !== 'string' || typeof value.minClientVersion !== 'string') throw new CatalogError('catalogSchemaError')
    if (!compatible(value.minClientVersion as string)) throw new CatalogError('catalogCompatibilityError')
    if (!Array.isArray(value.locales) || !value.locales.includes('en') || !value.locales.includes('es')) throw new CatalogError('catalogSchemaError')
    if (!Array.isArray(value.routes) || !Array.isArray(value.contentFiles) || value.contentFiles.length === 0 || !Array.isArray(value.sources) || value.sources.length === 0) throw new CatalogError('catalogSchemaError')
    if (value.sources.some((source) => !record(source) || typeof source.id !== 'string' || typeof source.name !== 'string' || typeof source.license !== 'string')) throw new CatalogError('catalogLicenseError')
    return value as unknown as CatalogManifest
}

function validateRelations(content: ContentItem[], exercises: ExerciseDefinition[], units: CatalogUnit[]): void {
    const ids = new Set(content.map((item) => item.id))
    if (ids.size !== content.length || exercises.some((exercise) => !ids.has(exercise.contentId)) || units.some((unit) => unit.contentIds.some((id) => !ids.has(id)) || unit.exerciseIds.some((id) => !exercises.some((exercise) => exercise.id === id)))) throw new CatalogError('catalogContentError')
    for (const item of content) for (const relation of item.relations ?? []) {
        const relationId = typeof relation === 'string' ? relation : relation.contentId
        if (!ids.has(relationId)) throw new CatalogError('catalogContentError')
    }
}

function validateContentItem(value: unknown): value is ContentItem {
    if (!record(value) || typeof value.id !== 'string' || value.id === '' || !['kana', 'kanji', 'vocabulary', 'grammar', 'sentence'].includes(String(value.type)) || !record(value.localized)) return false
    const localizedValue = value.localized as Record<string, unknown>
    return record(localizedValue.en) && typeof localizedValue.en.en === 'string' && (!localizedValue.es || (record(localizedValue.es) && typeof localizedValue.es.es === 'string'))
}

function validateExercise(value: unknown): value is ExerciseDefinition {
    if (!record(value) || typeof value.id !== 'string' || typeof value.contentId !== 'string' || typeof value.prompt !== 'string' || !['recognition', 'reading', 'meaning', 'writing'].includes(String(value.type)) || !['en', 'es'].includes(String(value.locale)) || value.premium !== false) return false
    const accepted = value.acceptedAnswers
    const options = value.options
    return (Array.isArray(accepted) && accepted.length > 0 && accepted.every((answer) => typeof answer === 'string' && answer !== '')) || (Array.isArray(options) && options.length > 0 && options.filter((option) => record(option) && option.correct === true).length === 1)
}

export function validateArtifact(manifest: CatalogManifest, units: CatalogUnit[], content: ContentItem[], exercises: ExerciseDefinition[]): CatalogArtifact {
    const route = manifest.routes.find((item) => item.id === 'n5')
    if (!route || route.unitIds.some((unitId) => !units.some((unit) => unit.id === unitId)) || content.some((item) => !validateContentItem(item)) || exercises.some((exercise) => !validateExercise(exercise)) || units.some((unit) => typeof unit.id !== 'string' || unit.routeId !== 'n5' || !Number.isInteger(unit.order) || !Array.isArray(unit.contentIds) || !Array.isArray(unit.exerciseIds))) throw new CatalogError('catalogContentError')
    validateRelations(content, exercises, units)
    return { manifest, units: [...units].sort((a, b) => a.order - b.order), content, exercises }
}

async function getJson<T>(url: string): Promise<T> {
    let response: Response
    try { response = await fetch(url) } catch { throw new CatalogError('catalogAssetError') }
    if (!response.ok) throw new CatalogError('catalogAssetError')
    try { return (await response.json()) as T } catch { throw new CatalogError('catalogSchemaError') }
}

export async function loadCatalog(baseUrl = `${import.meta.env.BASE_URL}content/`): Promise<CatalogArtifact> {
    const manifest = validateManifest(await getJson<unknown>(`${baseUrl}manifest.json`))
    const files = await Promise.all(manifest.contentFiles.map((file) => getJson<unknown>(`${baseUrl}${file}`)))
    const units: CatalogUnit[] = []
    const content: ContentItem[] = []
    const exercises: ExerciseDefinition[] = []
    for (const file of files) {
        if (!record(file) || !Array.isArray(file.units) || !Array.isArray(file.content) || !Array.isArray(file.exercises)) throw new CatalogError('catalogContentError')
        units.push(...file.units as CatalogUnit[])
        content.push(...file.content as ContentItem[])
        exercises.push(...file.exercises as ExerciseDefinition[])
    }
    return validateArtifact(manifest, units, content, exercises)
}

export function localized(item: ContentItem, locale: Locale): string {
    return item.localized[locale]?.[locale] ?? item.localized.en?.en ?? item.id
}

export class CatalogContentProvider {
    constructor(private readonly baseUrl?: string) {}

    load(): Promise<CatalogArtifact> {
        return loadCatalog(this.baseUrl)
    }
}
