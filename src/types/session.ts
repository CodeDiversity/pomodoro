// Session data types for IndexedDB persistence

export interface SessionRecord {
  id: string                    // UUID via crypto.randomUUID()
  startTimestamp: string        // ISO timestamp with milliseconds
  endTimestamp: string          // ISO timestamp with milliseconds
  plannedDurationSeconds: number
  actualDurationSeconds: number
  durationString: string        // "MM:SS" format
  mode: 'focus'               // Only focus for history
  startType: 'manual' | 'auto'
  completed: boolean
  noteText: string
  tags: string[]
  createdAt: number            // timestamp for indexing
}

export interface TagData {
  value: string               // tag text
  usageCount: number          // frequency for sorting suggestions
  lastUsed: number            // timestamp
}

export interface SessionNoteState {
  noteText: string
  tags: string[]
  lastSaved: number | null
  saveStatus: 'idle' | 'saving' | 'saved'
}
