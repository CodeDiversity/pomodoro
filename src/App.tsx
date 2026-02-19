import TimerDisplay from './components/TimerDisplay'
import { useTimer } from './hooks/useTimer'

function App() {
  const {
    state,
    start,
    pause,
    resume,
    reset,
    skip,
  } = useTimer()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <TimerDisplay
        timeRemaining={state.timeRemaining}
        mode={state.mode}
        sessionCount={state.sessionCount}
        isRunning={state.isRunning}
      />

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        {!state.isRunning ? (
          <button onClick={state.startTime ? resume : start} style={buttonStyle}>
            {state.startTime ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button onClick={pause} style={buttonStyle}>Pause</button>
        )}
        <button onClick={reset} style={buttonStyle}>Reset</button>
        <button onClick={skip} style={buttonStyle}>Skip</button>
      </div>
    </div>
  )
}

const buttonStyle = {
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
  cursor: 'pointer',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: '#333',
  color: 'white',
}

export default App
