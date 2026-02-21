import styled from 'styled-components'
import { colors, radii, transitions } from './ui/theme'

interface SidebarProps {
  activeView: 'timer' | 'history' | 'stats' | 'settings'
  onViewChange: (view: 'timer' | 'history' | 'stats' | 'settings') => void
}

const SidebarContainer = styled.aside`
  width: 240px;
  height: 100vh;
  background: ${colors.sidebarBg};
  border-right: 1px solid ${colors.sidebarBorder};
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
`

const LogoSection = styled.div`
  padding: 24px 20px;
  border-bottom: 1px solid ${colors.sidebarBorder};
`

const LogoText = styled.h1`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${colors.primary};
  letter-spacing: -0.5px;
`

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  gap: 4px;
  flex: 1;
`

const NavItem = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  border-radius: ${radii.md};
  background: ${props => props.$active ? colors.sidebarActive : 'transparent'};
  color: ${props => props.$active ? colors.sidebarActiveText : colors.text};
  font-size: 0.95rem;
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  transition: all ${transitions.normal};
  text-align: left;

  &:hover {
    background: ${props => props.$active ? colors.sidebarActive : colors.surface};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.primary};
  }

  svg {
    flex-shrink: 0;
  }
`

// Timer icon - circle with clock hands
const TimerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
)

// History icon - clock with circular arrow
const HistoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v5h5" />
    <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
    <path d="M12 7v5l4 2" />
  </svg>
)

// Stats icon - bar chart
const StatsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

// Settings icon - gear
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m4.22-10.22l4.24-4.24M6.34 17.66l-4.24 4.24M23 12h-6m-6 0H1m20.24 4.24l-4.24-4.24M6.34 6.34L2.1 2.1" />
  </svg>
)

const navItems = [
  { id: 'timer' as const, label: 'Timer', Icon: TimerIcon },
  { id: 'history' as const, label: 'History', Icon: HistoryIcon },
  { id: 'stats' as const, label: 'Statistics', Icon: StatsIcon },
  { id: 'settings' as const, label: 'Settings', Icon: SettingsIcon },
]

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <SidebarContainer>
      <LogoSection>
        <LogoText>FocusFlow</LogoText>
      </LogoSection>
      <NavList>
        {navItems.map(({ id, label, Icon }) => (
          <NavItem
            key={id}
            $active={activeView === id}
            onClick={() => onViewChange(id)}
          >
            <Icon />
            {label}
          </NavItem>
        ))}
      </NavList>
    </SidebarContainer>
  )
}

export default Sidebar
