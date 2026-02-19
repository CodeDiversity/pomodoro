import styled from 'styled-components'
import { DateFilter } from '../../utils/dateUtils'

const FilterBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`

const FilterChipsRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const FilterChip = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  border: 1px solid ${props => props.$active ? '#3498db' : '#ccc'};
  border-radius: 16px;
  background: ${props => props.$active ? '#3498db' : '#fff'};
  color: ${props => props.$active ? '#fff' : '#333'};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #3498db;
    background: ${props => props.$active ? '#2980b9' : '#f5f5f5'};
  }
`

const SearchInput = styled.input`
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.9rem;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #3498db;
  }

  &::placeholder {
    color: #999;
  }
`

interface HistoryFilterBarProps {
  dateFilter: DateFilter
  searchQuery: string
  onDateFilterChange: (filter: DateFilter) => void
  onSearchChange: (query: string) => void
}

const DATE_FILTER_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: '7 days' },
  { value: '30days', label: '30 days' },
  { value: 'all', label: 'All' },
]

export function HistoryFilterBar({
  dateFilter,
  searchQuery,
  onDateFilterChange,
  onSearchChange,
}: HistoryFilterBarProps) {
  return (
    <FilterBarContainer>
      <FilterChipsRow>
        {DATE_FILTER_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            $active={dateFilter === option.value}
            onClick={() => onDateFilterChange(option.value)}
          >
            {option.label}
          </FilterChip>
        ))}
      </FilterChipsRow>
      <SearchInput
        type="text"
        placeholder="Search notes and tags..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </FilterBarContainer>
  )
}
