import { useState, useEffect, useRef } from 'react'
import TimerDisplay from './components/TimerDisplay'
import TimerControls from './components/TimerControls'
import HelpPanel from './components/HelpPanel'
import Settings from './components/Settings'
import NotePanel from './components/NotePanel'
import TagInput from './components/TagInput'
import SessionSummary from './components/SessionSummary'
import { useTimer } from './hooks/useTimer'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useSessionNotes } from './hooks/useSessionNotes'
import { useSessionManager } from './hooks/useSessionManager'
import { getTagSuggestions } from './services/sessionStore'
import { TimerMode } from './types/timer'

function App() {
  // State for summary modal
  const [showSummary, setShowSummary] = useState(false)
  const [completedSession, setCompletedSession] = useState<{
    durationString: string
    noteText: string
    tags: string[]
    startTimestamp: string
  } | null>(null)

  // Tag suggestions state
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])

  // Timer state ref for session manager
  const timerStateRef = useRef({
    mode: 'focus' as TimerMode,
    isRunning: false,
    duration: 1500,
    startTime: null as number | null,
  })

  // Load tag suggestions on mount
  useEffect(() => {
    getTagSuggestions().then(setTagSuggestions)
  }, [])

  // Session notes hook
  const {
    noteText,
    tags,
    saveStatus,
    lastSaved,
    maxNoteLength,
    handleNoteChange,
    handleTagsChange,
    resetNotes,
  } = useSessionNotes(() => {
    // Background save - no action needed, status updates automatically
  })

  // Session manager hook - uses ref for timer state
  const noteState = { noteText, tags, lastSaved, saveStatus }

  const sessionManager = useSessionManager(
    {
      mode: timerStateRef.current.mode,
      isRunning: timerStateRef.current.isRunning,
      duration: timerStateRef.current.duration,
      startTime: timerStateRef.current.startTime,
      noteState,
    },
    {
      onSessionComplete: () => {
        // Session will be saved when timer hits 0 - this callback is for summary display
      },
      onSessionSkip: () => {
        // Save incomplete session and show summary
        setCompletedSession({
          durationString: '25:00',
          noteText: noteText,
          tags: tags,
          startTimestamp: new Date().toISOString(),
        })
        setShowSummary(true)
      },
      onSessionReset: () => {
        // Discard session and reset notes
        resetNotes()
      },
    }
  )

  // Handle session complete from timer
  const handleSessionComplete = async () => {
    const record = await sessionManager.handleSessionComplete()
    if (record) {
      setCompletedSession({
        durationString: record.durationString,
        noteText: record.noteText,
        tags: record.tags,
        startTimestamp: record.startTimestamp,
      })
      setShowSummary(true)
    }
  }

  // Handle session skip
  const handleSessionSkip = async () => {
    const record = await sessionManager.handleSessionSkip()
    if (record) {
      setCompletedSession({
        durationString: record.durationString,
        noteText: record.noteText,
        tags: record.tags,
        startTimestamp: record.startTimestamp,
      })
      setShowSummary(true)
    }
  }

  // Handle session reset
  const handleSessionReset = () => {
    sessionManager.handleSessionReset()
  }

  // Timer hook with session completion callback
  const {
    state,
    start,
    pause,
    resume,
    reset,
    skip,
    autoStart,
    setAutoStart,
  } = useTimer({ onSessionComplete: handleSessionComplete })

  // Update ref when timer state changes
  useEffect(() => {
    timerStateRef.current = {
      mode: state.mode,
      isRunning: state.isRunning,
      duration: state.duration,
      startTime: state.startTime,
    }
  }, [state.mode, state.isRunning, state.duration, state.startTime])

  // Determine visibility (only during Focus mode)
  const showNotePanel = state.mode === 'focus'

  // Set up keyboard shortcuts
  const handleToggle = () => {
    if (state.isRunning) {
      pause()
    } else if (state.startTime !== null) {
      resume()
    } else {
      start()
    }
  }

  useKeyboardShortcuts({
    onToggle: handleToggle,
    enabled: true,
  })

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1rem',
    }}>
      {/* Top right: Help and Settings */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        display: 'flex',
        gap: '0.5rem',
      }}>
        <HelpPanel />
        <Settings
          autoStart={autoStart}
          onAutoStartChange={setAutoStart}
        />
      </div>

      <TimerDisplay
        timeRemaining={state.timeRemaining}
        mode={state.mode}
        sessionCount={state.sessionCount}
        isRunning={state.isRunning}
      />

      <div style={{ marginTop: '2rem' }}>
        <TimerControls
          isRunning={state.isRunning}
          startTime={state.startTime}
          onStart={start}
          onPause={pause}
          onResume={resume}
          onReset={reset}
          onSkip={skip}
          onSessionSkip={handleSessionSkip}
          onSessionReset={handleSessionReset}
        />
      </div>

      <NotePanel
        isVisible={showNotePanel}
        noteText={noteText}
        onNoteChange={handleNoteChange}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
        maxLength={maxNoteLength}
      />

      <TagInput
        isVisible={showNotePanel}
        tags={tags}
        suggestions={tagSuggestions}
        onTagsChange={handleTagsChange}
      />

      <SessionSummary
        isVisible={showSummary}
        session={completedSession}
        onContinue={() => {
          setShowSummary(false)
          setCompletedSession(null)
          resetNotes()
          // Reload tag suggestions
          getTagSuggestions().then(setTagSuggestions)
        }}
      />
    </div>
  )
}

export default App
