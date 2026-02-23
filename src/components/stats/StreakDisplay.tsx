import React from 'react'
import { useAppSelector } from '../../app/hooks'
import { selectCurrentStreak, selectBestStreak, selectProtectionUsed } from '../../features/streak/streakSelectors'
import { FaFire, FaShieldAlt } from 'react-icons/fa'
import styled from 'styled-components'

const StreakContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
`

const StreakRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const FlameIcon = styled(FaFire)`
  color: #f97316;
  font-size: 24px;
`

const CurrentStreakCount = styled.span`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
`

const StreakLabel = styled.span`
  font-size: 16px;
  color: #64748b;
`

const BestStreakText = styled.div`
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
`

const ProtectionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #22c55e;
  font-weight: 500;
`

const ShieldIcon = styled(FaShieldAlt)`
  font-size: 16px;
`

/**
 * StreakDisplay component
 * Shows current streak with flame icon, best streak, and protection indicator
 */
export const StreakDisplay: React.FC = () => {
  const currentStreak = useAppSelector(selectCurrentStreak)
  const bestStreak = useAppSelector(selectBestStreak)
  const protectionUsed = useAppSelector(selectProtectionUsed)

  // Show protection indicator when streak >= 5 AND protection not used
  const showProtection = currentStreak >= 5 && !protectionUsed

  return (
    <StreakContainer>
      <StreakRow>
        <FlameIcon />
        <CurrentStreakCount>{currentStreak}</CurrentStreakCount>
        <StreakLabel>day streak</StreakLabel>
      </StreakRow>

      {bestStreak > 0 && (
        <BestStreakText>Best: {bestStreak} days</BestStreakText>
      )}

      {showProtection && (
        <ProtectionRow>
          <ShieldIcon />
          <span>Protection active</span>
        </ProtectionRow>
      )}
    </StreakContainer>
  )
}

export default StreakDisplay
