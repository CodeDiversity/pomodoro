import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  ChartData,
  ChartOptions,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { formatDuration } from '../../utils/statsUtils'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

export interface DailyFocusData {
  date: Date
  totalSeconds: number
}

interface WeeklyChartProps {
  data: DailyFocusData[]
}

/**
 * Weekly bar chart showing focus time for the last 7 days
 * Each bar represents total focus time for a day with gradient coloring
 * and tooltips showing formatted duration
 */
export function WeeklyChart({ data }: WeeklyChartProps) {
  const chartData: ChartData<'bar'> = useMemo(() => {
    const labels = data.map(d => {
      const date = new Date(d.date)
      return `${date.getMonth() + 1}/${date.getDate()}`
    })

    // Find max value for gradient calculation (exclude zero for gradient scaling)
    const nonZeroValues = data.map(d => d.totalSeconds)
    const maxValue = Math.max(...nonZeroValues, 1)

    // Create gradient background colors based on duration
    const backgroundColors = data.map(d => {
      if (d.totalSeconds === 0) {
        // Subtle gray for zero days
        return 'rgba(229, 231, 235, 0.5)'
      }
      // Gradient from light blue to dark blue based on ratio
      const ratio = d.totalSeconds / maxValue
      // Interpolate between #60a5fa (light blue) and #136dec (dark blue)
      const r = Math.round(96 + (19 - 96) * ratio)
      const g = Math.round(165 + (109 - 165) * ratio)
      const b = Math.round(250 + (236 - 250) * ratio)
      return `rgba(${r}, ${g}, ${b}, 0.8)`
    })

    // Use 30 seconds for zero days to show minimal bar
    const values = data.map(d => d.totalSeconds === 0 ? 30 : d.totalSeconds)

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    }
  }, [data])

  const options: ChartOptions<'bar'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: (items) => {
            if (!items.length) return ''
            const index = items[0].dataIndex
            const date = new Date(data[index].date)
            return date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })
          },
          label: (item) => {
            const index = item.dataIndex
            const originalValue = data[index].totalSeconds
            return formatDuration(originalValue)
          },
        },
      },
    },
    scales: {
      y: {
        display: false,
        beginAtZero: true,
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }), [data])

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}
