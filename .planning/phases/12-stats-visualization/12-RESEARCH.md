# Phase 12: Stats Visualization - Research

**Researched:** 2026-02-23
**Domain:** Data visualization / Charting library for React
**Confidence:** HIGH

## Summary

This phase implements a weekly bar chart visualization for focus time tracking using Chart.js. The user has explicitly chosen Chart.js (not custom SVG/CSS), and specified requirements include gradient bars (light blue to dark blue based on duration), custom tooltips showing readable duration (e.g., "2h 15m"), animated bar rendering, and responsive design.

**Primary recommendation:** Install `chart.js` and `react-chartjs-2`, create a WeeklyChart component in `src/components/stats/`, and integrate with existing session data from IndexedDB. Use Redux memoized selectors for data aggregation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Use Chart.js library (not custom SVG/CSS)
- Custom tooltips showing duration in readable format (e.g., "2h 15m")
- Bars animate from 0 to final height on initial render

### Layout & Placement
- Full-page Stats view (not sidebar widget)
- Chart appears with summary stats (today's time, weekly totals)
- Date range title above chart (e.g., "Feb 17 - Feb 23")
- Responsive resize on mobile (not horizontal scroll)

### Visual Styling
- Gradient bars: light blue (short duration) dark blue (long duration)
- Days with zero focus time: minimal bar (small height, subtle)
- Bars have rounded top corners
- X-axis shows dates (e.g., "2/17", "2/18")

### Claude's Discretion
- Exact gradient color stops
- Animation duration and easing
- Summary stats的具体内容 (what metrics to show)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STAT-01 | Weekly bar chart showing focus time per day (last 7 days) | Chart.js bar chart with 7 data points |
| STAT-02 | Bar chart renders in Stats view | Integration with existing StatsGrid component |
| STAT-03 | Chart uses app color scheme (blue primary) | Custom gradient using app's blue palette |
| STAT-04 | Hover shows exact duration for each day | Custom tooltip callbacks with formatDuration |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| chart.js | ^4.4.0 | Canvas-based charting library | User-specified; mature, well-documented |
| react-chartjs-2 | ^5.2.0 | React wrapper for Chart.js | Standard React integration for Chart.js |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react | ^18.3.1 | Already installed | Required for React integration |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| chart.js + react-chartjs-2 | Pure Chart.js without wrapper | react-chartjs-2 simplifies component integration |
| react-chartjs-2 | @chakra-ui/react-charts | Overkill - too heavy for single chart |
| chart.js | Recharts | User locked to Chart.js |

**Installation:**
```bash
npm install chart.js react-chartjs-2
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/stats/
│   ├── WeeklyChart.tsx       # Bar chart component
│   ├── StatsGrid.tsx         # Existing - keep as-is
│   └── StatCard.tsx          # Existing - keep as-is
├── hooks/
│   └── useWeeklyStats.ts     # New - aggregates last 7 days data
└── features/                 # Redux already set up
    └── stats/                # Optional: statsSlice if needed
```

### Pattern 1: React-Chartjs-2 Bar Chart
**What:** Using react-chartjs-2's `<Bar />` component with Chart.js registration
**When to use:** For any bar chart in React
**Example:**
```typescript
// Source: react-chartjs-2 documentation
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          const seconds = context.raw as number
          return formatDuration(seconds) // "2h 15m"
        }
      }
    }
  },
  animation: {
    duration: 800,
    easing: 'easeOutQuart'
  }
}

const data = {
  labels: ['2/17', '2/18', '2/19', '2/20', '2/21', '2/22', '2/23'],
  datasets: [{
    data: [3600, 5400, 1800, 0, 7200, 4500, 2700],
    backgroundColor: [...], // gradient colors
    borderRadius: 8,
  }]
}

<Bar options={options} data={data} />
```

### Pattern 2: Gradient Bar Colors
**What:** Dynamic gradient based on value intensity
**When to use:** When bars need gradient coloring based on duration
**Example:**
```typescript
// Create gradient based on max value
const getBarColors = (data: number[], maxValue: number): string[] => {
  const lightBlue = 'rgba(59, 130, 246, 0.6)'  // #3b82f6
  const darkBlue = 'rgba(19, 109, 236, 1)'      // #136dec

  return data.map(value => {
    if (value === 0) return 'rgba(229, 231, 235, 0.5)' // minimal for zero

    const ratio = value / maxValue
    // Interpolate between light and dark blue
    return ratio > 0.5 ? darkBlue : lightBlue
  })
}
```

### Pattern 3: Custom Tooltip with Duration Format
**What:** Tooltip showing readable duration instead of raw seconds
**When to use:** For any time-based data visualization
**Example:**
```typescript
// Using existing formatDuration from statsUtils
const options = {
  plugins: {
    tooltip: {
      callbacks: {
        title: (items) => {
          const index = items[0].dataIndex
          return formatDateShort(weekDates[index]) // "Feb 17"
        },
        label: (context) => {
          const seconds = context.raw as number
          return formatDuration(seconds) // "2h 15m"
        }
      }
    }
  }
}
```

### Pattern 4: Minimal Bar for Zero Days
**What:** Show subtle minimal-height bar for days with no sessions
**When to use:** When you want to show the day exists but had no activity
**Example:**
```typescript
// In data processing
const processedData = rawData.map(seconds =>
  seconds === 0 ? 60 : seconds // 60 seconds = minimal visible bar
)
// Store original for tooltip
const originalData = rawData
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chart rendering | Custom SVG bars | Chart.js | User locked to Chart.js; handles responsive, interactions, animations |
| Tooltip formatting | Manual hover handlers | Chart.js tooltip callbacks | Built-in, accessible, customizable |
| Canvas drawing | Direct canvas API | Chart.js | Much simpler API, responsive by default |

**Key insight:** Chart.js handles all complex canvas rendering, hit detection, and animation logic. Building equivalent functionality from scratch would take days.

## Common Pitfalls

### Pitfall 1: Chart Not Resizing Properly
**What goes wrong:** Chart doesn't resize when container changes
**Why it happens:** Missing `maintainAspectRatio: false` and proper container sizing
**How to avoid:** Wrap chart in sized container with `maintainAspectRatio: false` in options
**Warning signs:** Chart looks stretched or cut off on mobile

### Pitfall 2: Gradient Created on Every Render
**What goes wrong:** Performance issues from creating gradient on each render
**Why it happens:** Creating canvas gradient inside render function
**How to avoid:** Use `useMemo` for gradient creation or Chart.js scriptable options
**Warning signs:** Slow chart rendering, console warnings

### Pitfall 3: Tooltip Showing Wrong Duration Format
**What goes wrong:** Tooltip shows seconds instead of readable format
**Why it happens:** Not using tooltip callbacks or wrong callback context
**How to avoid:** Use `plugins.tooltip.callbacks.label` to format display

### Pitfall 4: React StrictMode Double Rendering
**What goes wrong:** Chart initializes twice in development
**Why it happens:** React 18 StrictMode renders twice in dev
**How to avoid:** Use `useEffect` cleanup or react-chartjs-2 handles this automatically

## Code Examples

### WeeklyChart Component
```typescript
// src/components/stats/WeeklyChart.tsx
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js'
import { formatDuration } from '../../utils/statsUtils'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

interface WeeklyChartProps {
  data: { date: Date; totalSeconds: number }[]
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxValue = useMemo(() =>
    Math.max(...data.map(d => d.totalSeconds), 1),
    [data]
  )

  const chartData = useMemo(() => ({
    labels: data.map(d => formatDateShort(d.date)),
    datasets: [{
      data: data.map(d => d.totalSeconds === 0 ? 30 : d.totalSeconds),
      backgroundColor: data.map(d => {
        if (d.totalSeconds === 0) return 'rgba(229, 231, 235, 0.5)'
        const ratio = d.totalSeconds / maxValue
        return ratio > 0.5 ? '#136dec' : '#60a5fa'
      }),
      borderRadius: 8,
      borderSkipped: false,
    }]
  }), [data, maxValue])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const originalValue = data[context.dataIndex].totalSeconds
            return formatDuration(originalValue)
          }
        }
      }
    },
    scales: {
      y: {
        display: false,
        beginAtZero: true,
      },
      x: {
        grid: { display: false },
      }
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart' as const,
    }
  }

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}
```

### Data Aggregation Hook
```typescript
// src/hooks/useWeeklyStats.ts
import { useState, useEffect } from 'react'
import { getAllSessions } from '../services/sessionStore'
import { SessionRecord } from '../types/session'

interface WeeklyData {
  date: Date
  totalSeconds: number
}

export function useWeeklyStats() {
  const [data, setData] = useState<WeeklyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const sessions = await getAllSessions()
      const focusSessions = sessions.filter(s => s.mode === 'focus')

      // Get last 7 days
      const today = new Date()
      today.setHours(23, 59, 59, 999)

      const weekData: WeeklyData[] = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)

        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        const dayTotal = focusSessions
          .filter(s => {
            const sessionDate = new Date(s.createdAt)
            return sessionDate >= date && sessionDate < nextDate
          })
          .reduce((sum, s) => sum + s.actualDurationSeconds, 0)

        weekData.push({ date, totalSeconds: dayTotal })
      }

      setData(weekData)
      setLoading(false)
    }

    loadData()
  }, [])

  return { data, loading }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No chart | Chart.js bar chart | Phase 12 | First visualization feature |
| Manual data processing | Memoized selectors/hooks | v2.1 | Efficient re-renders |

**Deprecated/outdated:**
- Chart.js 3.x: Older version, 4.x has better TypeScript support

## Open Questions

1. **Date Range Title Format**
   - What we know: User wants "Feb 17 - Feb 23" format
   - What's unclear: Should it update dynamically based on data?
   - Recommendation: Use static "Last 7 Days" or derive from data range

2. **Summary Stats Content**
   - What we know: Existing StatsGrid shows Today, Last 7 Days, Sessions Today, Longest
   - What's unclear: Should chart area show different/additional stats?
   - Recommendation: Keep existing StatsGrid, add weekly total below chart

3. **Gradient Color Specifics**
   - What we know: Light blue to dark blue based on duration
   - What's unclear: Exact hex codes and threshold for color change
   - Recommendation: Use #60a5fa (light) and #136dec (dark) with 50% threshold

## Validation Architecture

> Skipped - no test framework detected in project

## Sources

### Primary (HIGH confidence)
- Chart.js v4 Official Docs - https://www.chartjs.org/docs/
- react-chartjs-2 Documentation - https://react-chartjs-2.js.org/
- Existing codebase patterns (Redux, IndexedDB, styled-components)

### Secondary (MEDIUM confidence)
- Chart.js bar chart examples (community patterns)
- Gradient implementation patterns

### Tertiary (LOW confidence)
- Web search unavailable during research (API issues)

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH - Chart.js is well-established, user-specified
- Architecture: HIGH - Based on existing project patterns
- Pitfalls: MEDIUM - Known Chart.js issues documented

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (30 days for stable library)
