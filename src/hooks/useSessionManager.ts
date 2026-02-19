import { useCallback, useRef, useEffect } from 'react'
import { SessionRecord, SessionNoteState } from '../types/session'
import { saveSession, saveTag } from '../services/sessionStore'
import { TimerMode } from '../types/timer'

const CHECKPOINT_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

interface SessionManagerParams {
  mode: TimerMode
  isRunning: boolean
  duration: number
  startTime: number | null
  noteState: SessionNoteState
}

interface SessionManagerActions {
  onSessionComplete: () => void
  onSessionSkip: () => void
  onSessionReset: () => void
}

export function useSessionManager(
  params: SessionManagerParams,
  actions: SessionManagerActions
) {
  const sessionStartRef = useRef<number | null>(null)
  const lastCheckpointRef = useRef<number>(0)
  const hasCompletedRef = useRef(false)

  // Format duration as MM:SS
  const formatDuration = (secs: number): string => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`
  }

  // Create a complete session record
  const createSessionRecord = useCallback((completed: boolean): SessionRecord => {
    const now = Date.now()
    const startTime = sessionStartRef.current || now
    const actualDuration = params.duration - (completed ? 0 : Math.floor((now - startTime) / 1000))

    const record: SessionRecord = {
      id: crypto.randomUUID(),
      startTimestamp: new Date(startTime).toISOString(),
      endTimestamp: new Date(now).toISOString(),
      plannedDurationSeconds: params.duration,
      actualDurationSeconds: completed ? params.duration : Math.max(0, actualDuration),
      durationString: formatDuration(completed ? params.duration : Math.max(0, actualDuration)),
      mode: 'focus',  // Only focus sessions are recorded
      startType: 'manual', // Could track auto-start separately
      completed,
      noteText: params.noteState.noteText,
      tags: params.noteState.tags,
      createdAt: now,
    }

    return record
  }, [params.duration, params.noteState])

  // Save session and tags
  const saveSessionRecord = useCallback(async (completed: boolean) => {
    if (params.mode !== 'focus') return // Only save focus sessions

    const record = createSessionRecord(completed)
    await saveSession(record)

    // Save tags for autocomplete
    for (const tag of record.tags) {
      await saveTag(tag)
    }

    return record
  }, [params.mode, createSessionRecord])

  // Periodic checkpoint during active session
  useEffect(() => {
    if (!params.isRunning || params.mode !== 'focus') return
    if (!sessionStartRef.current) {
      sessionStartRef.current = Date.now()
      lastCheckpointRef.current = Date.now()
    }

    const interval = setInterval(async () => {
      const now = Date.now()
      if (now - lastCheckpointRef.current >= CHECKPOINT_INTERVAL_MS) {
        // Save checkpoint
        await saveSessionRecord(false)
        lastCheckpointRef.current = now
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [params.isRunning, params.mode, saveSessionRecord])

  // Handle session start - reset flags
  useEffect(() => {
    if (params.isRunning && params.mode === 'focus') {
      sessionStartRef.current = Date.now()
      lastCheckpointRef.current = Date.now()
      hasCompletedRef.current = false
    }
  }, [params.isRunning, params.mode])

  // Session complete handler (called when timer hits 0)
  const handleSessionComplete = useCallback(async () => {
    if (params.mode !== 'focus' || hasCompletedRef.current) return
    hasCompletedRef.current = true

    const record = await saveSessionRecord(true)
    actions.onSessionComplete()

    return record
  }, [params.mode, saveSessionRecord, actions])

  // Session skip handler
  const handleSessionSkip = useCallback(async () => {
    if (params.mode !== 'focus') return
    hasCompletedRef.current = true

    const record = await saveSessionRecord(false)
    actions.onSessionSkip()

    return record
  }, [params.mode, saveSessionRecord, actions])

  // Session reset handler - DISCARD (don't save)
  const handleSessionReset = useCallback(() => {
    hasCompletedRef.current = true
    sessionStartRef.current = null
    lastCheckpointRef.current = 0
    actions.onSessionReset()
  }, [actions])

  // Manual save handler
  const handleManualSave = useCallback(async () => {
    if (params.mode !== 'focus' || !params.isRunning) return
    await saveSessionRecord(false)
    lastCheckpointRef.current = Date.now()
  }, [params.mode, params.isRunning, saveSessionRecord])

  return {
    handleSessionComplete,
    handleSessionSkip,
    handleSessionReset,
    handleManualSave,
  }
}
