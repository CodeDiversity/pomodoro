import styled from 'styled-components'

interface StatCardProps {
  label: string
  value: string
  subtext?: string
}

const CardContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  }
`

const Label = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
`

const Value = styled.span`
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
`

const Subtext = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
`

/**
 * Individual stat card component displaying a label, value, and optional subtext
 */
export function StatCard({ label, value, subtext }: StatCardProps) {
  return (
    <CardContainer>
      <Label>{label}</Label>
      <Value>{value}</Value>
      {subtext && <Subtext>{subtext}</Subtext>}
    </CardContainer>
  )
}
