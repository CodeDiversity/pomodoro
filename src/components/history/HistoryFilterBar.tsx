import styled from 'styled-components'
import { DateFilter } from '../../utils/dateUtils'
import { colors, radii, shadows, spacing, transitions } from '../ui/theme'

const FilterBarContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
`

const SearchContainer = styled.div`
  flex: 1;
  position: relative;
`

const SearchIcon = styled.svg`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #666;
  pointer-events: none;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px;
  padding-left: 40px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  color: ${colors.text};
  box-sizing: border-box;
  transition: border-color ${transitions.fast};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }

  &::placeholder {
    color: #999;
  }
`

const FilterDropdownContainer = styled.div`
  position: relative;
`

const FilterSelect = styled.select`
  appearance: none;
  background: white;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  padding: 10px 36px 10px 16px;
  min-width: 130px;
  font-size: 0.9rem;
  color: ${colors.text};
  cursor: pointer;
  transition: border-color ${transitions.fast};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`

const ChevronIcon = styled.svg`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #666;
  pointer-events: none;
`

const CalendarButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  cursor: pointer;
  transition: all ${transitions.fast};

  &:hover {
    background: #F5F5F5;
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`

const CalendarIcon = styled.svg`
  width: 18px;
  height: 18px;
  color: ${colors.text};
`

interface HistoryFilterBarProps {
  dateFilter: DateFilter
  searchQuery: string
  onDateFilterChange: (filter: DateFilter) => void
  onSearchChange: (query: string) => void
}

const DATE_FILTER_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
]

export function HistoryFilterBar({
  dateFilter,
  searchQuery,
  onDateFilterChange,
  onSearchChange,
}: HistoryFilterBarProps) {
  return (
    <FilterBarContainer>
      <SearchContainer>
        <SearchIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </SearchIcon>
        <SearchInput
          type="text"
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </SearchContainer>

      <FilterDropdownContainer>
        <FilterSelect
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value as DateFilter)}
        >
          {DATE_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FilterSelect>
        <ChevronIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </ChevronIcon>
      </FilterDropdownContainer>

      <CalendarButton
        onClick={() => {
          // Placeholder - can be extended to show date picker
          console.log('Calendar button clicked')
        }}
        aria-label="Open calendar"
      >
        <CalendarIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </CalendarIcon>
      </CalendarButton>
    </FilterBarContainer>
  )
}
