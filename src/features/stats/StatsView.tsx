import React, { useMemo } from 'react'
import { useAppSelector } from '../../app/hooks'
import { selectAllSessions } from '../history/historySelectors'
import { groupSessionsByDay } from '../../utils/streakUtils'
import { StreakDisplay } from '../../components/stats/StreakDisplay'
import { CalendarHeatmap } from '../../components/stats/CalendarHeatmap'
import { WeeklyChart, DailyFocusData } from '../../components/stats/WeeklyChart'
import { StatsGrid } from '../../components/stats/StatsGrid'

interface StatsViewProps {
  weeklyData: DailyFocusData[]
  weeklyLoading: boolean
}

/**
 * StatsView component
 * Displays streak display, calendar heatmap, weekly chart, and stats grid
 */
export const StatsView: React.FC<StatsViewProps> = ({ weeklyData, weeklyLoading }) => {
  const sessions = useAppSelector(selectAllSessions)

  // Compute daily activity from sessions for calendar heatmap
  const dailyActivity = useMemo(() => {
    return groupSessionsByDay(sessions)
  }, [sessions])

  return (
    <div style={{ width: '100%', maxWidth: '800px', padding: '24px' }}>
      {/* Streak Display */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '16px'
      }}>
        <StreakDisplay />
      </div>

      {/* Calendar Heatmap */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '16px'
      }}>
        <CalendarHeatmap dailyActivity={dailyActivity} />
      </div>

      {/* Weekly Chart */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '16px'
      }}>
        {/* Date range title */}
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#64748b',
          marginBottom: '16px'
        }}>
          {weeklyData.length > 0 && (() => {
            const firstDate = new Date(weeklyData[0].date)
            const lastDate = new Date(weeklyData[weeklyData.length - 1].date)
            const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
            return `${firstDate.toLocaleDateString('en-US', formatOptions)} - ${lastDate.toLocaleDateString('en-US', formatOptions)}`
          })()}
        </div>
        {weeklyLoading ? (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            Loading...
          </div>
        ) : (
          <WeeklyChart data={weeklyData} />
        )}
      </div>

      {/* Stats Grid */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <StatsGrid dateFilter="7days" />
      </div>
    </div>
  )
}

export default StatsView
