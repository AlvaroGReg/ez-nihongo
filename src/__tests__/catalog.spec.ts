import { describe, expect, it } from 'vitest'

import { CatalogError, validateManifest } from '@/services/catalog'

describe('catalog manifest', () => {
    it('accepts compatible bilingual manifests', () => {
        expect(validateManifest({ schemaVersion: 1, catalogVersion: '0.3.0', minClientVersion: '0.3.0', locales: ['en', 'es'], routes: [{ id: 'n5', unitIds: ['unit'] }], contentFiles: ['n5.json'], sources: [{ id: 'source', name: 'Source', license: 'CC BY 4.0' }] }).catalogVersion).toBe('0.3.0')
    })

    it('rejects unsupported schema versions', () => {
        expect(() => validateManifest({ schemaVersion: 2 })).toThrowError(CatalogError)
    })
})
