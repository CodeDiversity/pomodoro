import styled from 'styled-components'
import { colors } from '../ui/theme'

const TermsContainer = styled.div`
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

const List = styled.ul`
  margin: 8px 0;
  padding-left: 20px;
`

const ListItem = styled.li`
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${colors.textMuted};
  margin-bottom: 4px;
`

const Disclaimer = styled.div`
  background: #FFF4E5;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
`

const DisclaimerTitle = styled.strong`
  font-size: 0.9rem;
  color: #B45309;
  display: block;
  margin-bottom: 8px;
`

const DisclaimerText = styled.p`
  font-size: 0.85rem;
  color: #92400E;
  margin: 0;
  line-height: 1.5;
`

export default function TermsOfUse() {
  const currentYear = new Date().getFullYear()

  return (
    <TermsContainer>
      <Section>
        <SectionTitle>Acceptance of Terms</SectionTitle>
        <Paragraph>
          By using the Pomodoro Timer app, you agree to these Terms of Use. If you do not agree
          to these terms, please do not use the app.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>User Rights</SectionTitle>
        <Paragraph>
          As a user of this app, you have the following rights:
        </Paragraph>
        <List>
          <ListItem><strong>Use the app:</strong> You may use the Pomodoro Timer to manage your focus sessions</ListItem>
          <ListItem><strong>Track sessions:</strong> You may record and track your work sessions</ListItem>
          <ListItem><strong>View history:</strong> You may review your session history and statistics</ListItem>
          <ListItem><strong>Customize settings:</strong> You may adjust timer durations and preferences to suit your needs</ListItem>
          <ListItem><strong>Export data:</strong> Your data remains yours and can be cleared at any time</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>Disclaimers</SectionTitle>
        <Disclaimer>
          <DisclaimerTitle>Disclaimer of Warranties</DisclaimerTitle>
          <DisclaimerText>
            The Pomodoro Timer app is provided "as is" without any warranties, express or implied.
            We do not guarantee that the app will be error-free, uninterrupted, or suitable for
            your specific needs.
          </DisclaimerText>
        </Disclaimer>
      </Section>

      <Section>
        <SectionTitle>Limitation of Liability</SectionTitle>
        <Paragraph>
          In no event shall the developers of this app be liable for any indirect, incidental,
          special, or consequential damages arising out of or in connection with your use of
          the app. Your use of the app is at your own risk.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>Contact Information</SectionTitle>
        <Paragraph>
          If you have any questions about these Terms of Use, please contact us. These terms
          were last updated in {currentYear}.
        </Paragraph>
      </Section>
    </TermsContainer>
  )
}
