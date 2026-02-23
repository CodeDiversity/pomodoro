import React, { useMemo, useState } from 'react'
import { eachDayOfInterval, startOfMonth, endOfMonth, format, isToday } from 'date-fns'
import styled from 'styled-components'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { DailyActivity } from '../../utils/streakUtils'

interface CalendarHeatmapProps {
  dailyActivity: Map<string, DailyActivity>
}

const HeatmapContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const MonthHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
`

const MonthTitle = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`

const NavButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #64748b;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: #136dec;
  }
`

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`

const DayCell = styled.div<{ $intensity: number; $isToday: boolean; $isCurrentMonth: boolean }>`
  aspect-ratio: 1;
  border-radius: 6px;
  background-color: ${props => {
    if (!props.$isCurrentMonth) return 'transparent'
    if (props.$intensity === 0) return '#e5e7eb'
    if (props.$intensity <= 2) return '#bfdbfe'  // light blue
    if (props.$intensity <= 4) return '#60a5fa'  // medium blue
    return '#1d4ed8'                               // dark blue
  }};
  border: ${props => props.$isToday ? '2px solid #136dec' : 'none'};
  cursor: pointer;
  position: relative;
  min-height: 36px;
  opacity: ${props => props.$isCurrentMonth ? 1 : 0.3};

  &:hover .tooltip {
    opacity: 1;
    visibility: visible;
  }
`

const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  margin-bottom: 8px;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: #1e293b;
  }
`

const DayNumber = styled.span<{ $isToday: boolean }>`
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 10px;
  font-weight: 500;
  color: ${props => props.$isToday ? '#136dec' : '#64748b'};
`

const WeekdayHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
`

const WeekdayLabel = styled.div`
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  padding: 4px 0;
`

const EmptyCell = styled.div`
  aspect-ratio: 1;
  min-height: 36px;
`

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * CalendarHeatmap component
 * Displays monthly calendar grid with color-coded daily activity
 */
export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ dailyActivity }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const calendarStart = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const dayOfWeek = start.getDay()
    // Get days from previous month to fill the first week
    const prevMonthDays: Date[] = []
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      const d = new Date(start)
      d.setDate(d.getDate() - i - 1)
      prevMonthDays.push(d)
    }
    return prevMonthDays
  }, [currentMonth])

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <HeatmapContainer>
      <MonthHeader>
        <NavButton onClick={goToPreviousMonth} aria-label="Previous month">
          <FaChevronLeft size={14} />
        </NavButton>
        <MonthTitle>{format(currentMonth, 'MMMM yyyy')}</MonthTitle>
        <NavButton onClick={goToNextMonth} aria-label="Next month">
          <FaChevronRight size={14} />
        </NavButton>
      </MonthHeader>

      <WeekdayHeader>
        {weekdays.map(day => (
          <WeekdayLabel key={day}>{day}</WeekdayLabel>
        ))}
      </WeekdayHeader>

      <CalendarGrid>
        {/* Days from previous month */}
        {calendarStart.map((_, idx) => (
          <EmptyCell key={`prev-${idx}`} />
        ))}

        {/* Days of current month */}
        {days.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const activity = dailyActivity.get(dateKey)
          const sessionCount = activity?.sessionCount || 0
          const totalSeconds = activity?.totalSeconds || 0
          const isTodayCell = isToday(day)

          return (
            <DayCell
              key={dateKey}
              $intensity={sessionCount}
              $isToday={isTodayCell}
              $isCurrentMonth={true}
            >
              <Tooltip className="tooltip">
                {dateKey}: {sessionCount} sessions ({formatDuration(totalSeconds)})
              </Tooltip>
              {isTodayCell && <DayNumber $isToday={true}>{format(day, 'd')}</DayNumber>}
            </DayCell>
          )
        })}
      </CalendarGrid>
    </HeatmapContainer>
  )
}

export default CalendarHeatmap
