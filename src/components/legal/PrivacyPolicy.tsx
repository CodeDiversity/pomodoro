import styled from 'styled-components'
import { colors, transitions } from '../ui/theme'

const PolicyContainer = styled.div`
  padding: 8px 0;
  max-height: 60vh;
  overflow-y: auto;
`

const Section = styled.section`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${colors.text};
  margin: 0 0 8px 0;
`

const Paragraph = styled.p`
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${colors.textMuted};
  margin: 0 0 12px 0;

  &:last-child {
    margin-bottom: 0;
  }
`

const Highlight = styled.span`
  color: ${colors.primary};
  font-weight: 500;
`

export default function PrivacyPolicy() {
  const currentYear = new Date().getFullYear()

  return (
    <PolicyContainer>
      <Section>
        <SectionTitle>Introduction</SectionTitle>
        <Paragraph>
          This Privacy Policy describes how the Pomodoro Timer app collects, uses, and protects
          your personal information. Your privacy is important to us, and we are committed to
          protecting your data.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>Data Collection</SectionTitle>
        <Paragraph>
          The Pomodoro Timer app collects the following information:
        </Paragraph>
        <Paragraph>
          - <strong>Session Data:</strong> Focus session duration, start/end times, and completion status
        </Paragraph>
        <Paragraph>
          - <strong>Notes and Tags:</strong> Task titles, notes, and tags you add to your sessions
        </Paragraph>
        <Paragraph>
          - <strong>Settings:</strong> Your timer duration preferences and notification settings
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>Data Storage</SectionTitle>
        <Paragraph>
          <Highlight>Your data is stored locally in your browser using IndexedDB.</Highlight> No data
          is transmitted to any external servers. All your session history, notes, and settings
          remain on your device and are never uploaded to or shared with any third party.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>Data Usage</SectionTitle>
        <Paragraph>
          The data you provide is used solely to:
        </Paragraph>
        <Paragraph>
          - Track your focus sessions and productivity
        </Paragraph>
        <Paragraph>
          - Display your session history and statistics
        </Paragraph>
        <Paragraph>
          - Persist your settings and preferences
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>Contact Information</SectionTitle>
        <Paragraph>
          If you have any questions about this Privacy Policy, please contact us. This policy
          was last updated in {currentYear}.
        </Paragraph>
      </Section>
    </PolicyContainer>
  )
}
