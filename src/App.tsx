import { useState, useEffect, useRef } from 'react'
import TimerDisplay from './components/TimerDisplay'
import TimerControls from './components/TimerControls'
import Settings from './components/Settings'
import NotePanel from './components/NotePanel'
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
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from './services/persistence'
import { TimerMode } from './types/timer'
import { SessionRecord } from './types/session'
import { useAppSelector, useAppDispatch } from './app/hooks'
import { setViewMode, openDrawer, closeDrawer, showSummaryModal, hideSummaryModal } from './features/ui/uiSlice'

import styled from 'styled-components'
import { transitions } from './components/ui/theme'

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  font-family: system-ui, -apple-system, sans-serif;
`

const MainContent = styled.main`
  flex: 1;
  margin-left: 240px;
  background: #f6f7f8;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const ContentArea = styled.div`
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  height: calc(100vh - 65px);
`

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e2e8f0;
  height: 64px;
`

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
`

const StatusDot = styled.div<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #136dec;
  animation: ${props => props.$active ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'};

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: .5;
    }
  }
`

const TopBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const NotificationButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #64748b;
  transition: all ${transitions.fast};

  &:hover {
    color: #136dec;
  }
`

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(19, 109, 236, 0.2);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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
  height: 100%;
  background: white;
  border-left: 1px solid #e2e8f0;
`

function App() {
  // Redux dispatch and selectors for UI state
  const dispatch = useAppDispatch()
  const viewMode = useAppSelector(state => state.ui.viewMode)
  const isDrawerOpen = useAppSelector(state => state.ui.isDrawerOpen)
  const selectedSessionId = useAppSelector(state => state.ui.selectedSessionId)
  const showSummary = useAppSelector(state => state.ui.showSummary)

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

  // Find selected session from sessions list based on ID from Redux
  const selectedSession = sessions.find(s => s.id === selectedSessionId) || null

  const handleSessionClick = (session: SessionRecord) => {
    dispatch(openDrawer(session.id))
  }

  const handleDrawerClose = () => {
    dispatch(closeDrawer())
  }

  const handleSessionDelete = () => {
    refetch()
  }

  // State for summary modal (still local - completed session data)
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
      notificationSound: DEFAULT_SETTINGS.notificationSound,
      volume: DEFAULT_SETTINGS.volume,
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
    taskTitle,
    saveStatus,
    lastSaved,
    handleNoteChange,
    handleTagsChange,
    handleTaskTitleChange,
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
        dispatch(showSummaryModal())
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
      dispatch(showSummaryModal())
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
      dispatch(showSummaryModal())
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
      <Sidebar activeView={viewMode} onViewChange={(view) => dispatch(setViewMode(view))} />

      <MainContent>
        {/* Top bar with status indicator */}
        <TopBar>
          <StatusIndicator>
            <StatusDot $active={state.isRunning || state.startTime !== null} />
            Focus Session Active
          </StatusIndicator>
          <TopBarActions>
            <NotificationButton aria-label="Notifications">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </NotificationButton>
            <Avatar>
              <img src="https://ui-avatars.com/api/?name=User&background=136dec&color=fff" alt="User Profile" />
            </Avatar>
          </TopBarActions>
        </TopBar>

        <ContentArea>
          {/* Timer View */}
          {viewMode === 'timer' && (
            <SplitPaneContainer>
              <LeftPane>
                <TimerDisplay
                  timeRemaining={state.timeRemaining}
                  duration={state.duration}
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
                    taskTitle={taskTitle}
                    onTaskTitleChange={handleTaskTitleChange}
                    noteText={noteText}
                    onNoteChange={handleNoteChange}
                    tags={tags}
                    suggestions={tagSuggestions}
                    onTagsChange={handleTagsChange}
                    onCompleteSession={handleSessionSkip}
                  />
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
                  onStartTimer={() => dispatch(setViewMode('timer'))}
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
          dispatch(hideSummaryModal())
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