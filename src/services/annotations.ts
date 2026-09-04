import { loadAnnotations, saveAnnotations } from '@/services/storage'
import type { Annotation } from '@/types/domain'

export function getAnnotations(): Record<string, Annotation> {
    return loadAnnotations()
}

export function setFavorite(contentId: string, favorite: boolean): Annotation {
    const annotations = loadAnnotations()
    const annotation = { ...(annotations[contentId] ?? { contentId, favorite: false, note: '' }), favorite, updatedAt: new Date().toISOString() }
    annotations[contentId] = annotation
    saveAnnotations(annotations)
    return annotation
}

export function setNote(contentId: string, note: string): Annotation {
    const annotations = loadAnnotations()
    const annotation = { ...(annotations[contentId] ?? { contentId, favorite: false, note: '' }), note, updatedAt: new Date().toISOString() }
    annotations[contentId] = annotation
    saveAnnotations(annotations)
    return annotation
}
