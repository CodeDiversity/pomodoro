import styled from 'styled-components'
import { colors, transitions } from './ui/theme'

interface FooterProps {
  onPrivacyPolicyClick: () => void
  onTermsOfUseClick: () => void
}

const FooterContainer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  border-top: 1px solid ${colors.border};
  background: ${colors.surface};

  @media (max-width: 480px) {
    flex-direction: column;
    text-align: center;
    gap: 12px;
    padding: 16px;
  }
`

const FooterLinks = styled.div`
  display: flex;
  gap: 24px;

  @media (max-width: 480px) {
    gap: 16px;
  }
`

const FooterLink = styled.button`
  background: none;
  border: none;
  color: ${colors.primary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all ${transitions.fast};

  &:hover {
    color: ${colors.primaryHover};
    text-decoration: underline;
    background: rgba(19, 109, 236, 0.05);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.primary};
  }
`

const Copyright = styled.span`
  font-size: 0.8rem;
  color: ${colors.textMuted};
`

export default function Footer({ onPrivacyPolicyClick, onTermsOfUseClick }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <FooterContainer>
      <FooterLinks>
        <FooterLink onClick={onPrivacyPolicyClick}>
          Privacy Policy
        </FooterLink>
        <FooterLink onClick={onTermsOfUseClick}>
          Terms of Use
        </FooterLink>
      </FooterLinks>
      <Copyright>
        {currentYear} Pomodoro Timer. All rights reserved.
      </Copyright>
    </FooterContainer>
  )
}
