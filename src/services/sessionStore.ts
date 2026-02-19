import { initDB } from './db'
import { SessionRecord, TagData } from '../types/session'

// Session operations
export async function saveSession(record: SessionRecord): Promise<void> {
  const db = await initDB()
  await db.put('sessions', record)
}

export async function getSession(id: string): Promise<SessionRecord | undefined> {
  const db = await initDB()
  return db.get('sessions', id)
}

export async function getAllSessions(): Promise<SessionRecord[]> {
  const db = await initDB()
  return db.getAllFromIndex('sessions', 'by-date')
}

export async function deleteSession(id: string): Promise<void> {
  const db = await initDB()
  await db.delete('sessions', id)
}

// Tag operations
export async function saveTag(value: string): Promise<void> {
  const db = await initDB()
  const existing = await db.get('tags', value)
  const tagData: TagData = {
    value,
    usageCount: (existing?.usageCount || 0) + 1,
    lastUsed: Date.now(),
  }
  await db.put('tags', tagData)
}

export async function getAllTags(): Promise<TagData[]> {
  const db = await initDB()
  return db.getAll('tags')
}

export async function getTagSuggestions(limit = 10): Promise<string[]> {
  const tags = await getAllTags()
  return tags
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit)
    .map(t => t.value)
}
