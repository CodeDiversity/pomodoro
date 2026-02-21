import { useState, useEffect, useRef } from 'react'
import TimerDisplay from './components/TimerDisplay'
import TimerControls from './components/TimerControls'
import Settings from './components/Settings'
import NotePanel from './components/NotePanel'
import TagInput from './components/TagInput'
import SessionSummary from './components/SessionSummary'
import { HistoryList } from './components/history/HistoryList'
import { HistoryDrawer } from './components/history/HistoryDrawer'
import { StatsGrid } from './components/stats/StatsGrid'
import Sidebar from './components/Sidebar'
import { useTimer } from './hooks/useTimer'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useSessionNotes } from './hooks/useSessionNotes'
import { useSessionManager } from './hooks/useSessionManager'
import { useSessionHistory } from './hooks/useSessionHistory'
import { getTagSuggestions } from './services/sessionStore'
import { loadSettings, saveSettings } from './services/persistence'
import { TimerMode } from './types/timer'
import { SessionRecord } from './types/session'

import styled from 'styled-components'
import { colors, transitions } from './components/ui/theme'

type ViewMode = 'timer' | 'history' | 'stats' | 'settings'

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  font-family: system-ui, -apple-system, sans-serif;
`

const MainContent = styled.main`
  flex: 1;
  margin-left: 240px;
  background: #F8F9FA;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const ContentArea = styled.div`
  flex: 1;
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  height: calc(100vh - 65px);
`

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #E8E8E8;
  gap: 16px;
`

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${colors.text};
`

const StatusDot = styled.div<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.$active ? colors.success : colors.textMuted};
  transition: background-color ${transitions.normal};
`


// Split-pane layout for timer view
const SplitPaneContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
  }
`

const LeftPane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  min-width: 300px;
  height: 100%;
  padding: 24px;
`

const RightPane = styled.div`
  flex: 0 0 420px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 24px;
  background: white;
  border-left: 1px solid #E8E8E8;
`

const CompleteSessionButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #1A1A1A;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color ${transitions.fast};
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background-color: #333;
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`

const ProTipCard = styled.div`
  background: #F0F7FF;
  border-left: 3px solid #0066FF;
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
  font-size: 0.85rem;
  color: #333;
  line-height: 1.5;
  margin-top: auto;
  margin-bottom: 16px;
`

function App() {
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('timer')

  // History state
  const {
    sessions,
    filteredSessions,
    dateFilter,
    searchQuery,
    setDateFilter,
    setSearchQuery,
    isLoading: historyLoading,
    refetch,
  } = useSessionHistory()

  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleSessionClick = (session: SessionRecord) => {
    setSelectedSession(session)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setSelectedSession(null)
  }

  const handleSessionDelete = () => {
    refetch()
  }

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

  // Custom durations state
  const [customDurations, setCustomDurationsState] = useState<{
    focus: number
    shortBreak: number
    longBreak: number
  } | null>(null)

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

  // Load custom durations from settings on mount
  useEffect(() => {
    loadSettings().then((settings) => {
      setCustomDurationsState({
        focus: settings.focusDuration,
        shortBreak: settings.shortBreakDuration,
        longBreak: settings.longBreakDuration,
      })
    })
  }, [])

  // Handle saving custom durations
  const handleSaveDurations = async (durations: { focus: number; shortBreak: number; longBreak: number }) => {
    // Persist to IndexedDB
    await saveSettings({
      autoStart,
      focusDuration: durations.focus,
      shortBreakDuration: durations.shortBreak,
      longBreakDuration: durations.longBreak,
    })
    // Apply to timer (this updates timer display and resets if running)
    setCustomDurations(durations)
    // Update local state
    setCustomDurationsState(durations)
  }

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
    setCustomDurations,
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

  // Refresh history when switching to history tab
  useEffect(() => {
    if (viewMode === 'history') {
      refetch()
    }
  }, [viewMode, refetch])

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
    enabled: viewMode === 'timer',
  })

  return (
    <AppContainer>
      <Sidebar activeView={viewMode} onViewChange={setViewMode} />

      <MainContent>
        {/* Top bar with status indicator */}
        <TopBar>
          <StatusIndicator>
            <StatusDot $active={state.isRunning || state.startTime !== null} />
            Focus Session Active
          </StatusIndicator>
          <Settings
            autoStart={autoStart}
            onAutoStartChange={setAutoStart}
            customDurations={customDurations || undefined}
            onSaveDurations={handleSaveDurations}
          />
        </TopBar>

        <ContentArea>
          {/* Timer View */}
          {viewMode === 'timer' && (
            <SplitPaneContainer>
              <LeftPane>
                <TimerDisplay
                  timeRemaining={state.timeRemaining}
                  mode={state.mode}
                  sessionCount={state.sessionCount}
                  isRunning={state.isRunning}
                />

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
              </LeftPane>

              {showNotePanel && (
                <RightPane>
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

                  <ProTipCard>
                    <strong>Pro Tip:</strong> Take a moment to jot down what you accomplished before ending your session.
                  </ProTipCard>

                  <CompleteSessionButton onClick={handleSessionSkip}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Complete Session
                  </CompleteSessionButton>
                </RightPane>
              )}
            </SplitPaneContainer>
          )}

          {/* History View */}
          {viewMode === 'history' && (
            <>
              <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
                <HistoryList
                  sessions={sessions}
                  filteredSessions={filteredSessions}
                  dateFilter={dateFilter}
                  searchQuery={searchQuery}
                  isLoading={historyLoading}
                  onDateFilterChange={setDateFilter}
                  onSearchChange={setSearchQuery}
                  onSessionClick={handleSessionClick}
                  onStartTimer={() => setViewMode('timer')}
                />
              </div>
              <HistoryDrawer
                session={selectedSession}
                isOpen={isDrawerOpen}
                onClose={handleDrawerClose}
                onDelete={handleSessionDelete}
                onSave={refetch}
              />
            </>
          )}

          {/* Stats View */}
          {viewMode === 'stats' && (
            <div style={{ width: '100%', maxWidth: '800px', padding: '24px' }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <StatsGrid dateFilter="7days" />
              </div>
            </div>
          )}

          {/* Settings View */}
          {viewMode === 'settings' && (
            <Settings
              autoStart={autoStart}
              onAutoStartChange={setAutoStart}
              customDurations={customDurations || undefined}
              onSaveDurations={handleSaveDurations}
              viewMode="page"
            />
          )}
        </ContentArea>
      </MainContent>

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
    </AppContainer>
  )
}

export default App
