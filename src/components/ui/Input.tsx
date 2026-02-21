import styled from 'styled-components';
import { colors, radii, transitions, spacing } from './theme';

const baseInputStyles = `
  width: 100%;
  padding: ${spacing.sm} ${spacing.md};
  font-size: 14px;
  font-family: inherit;
  color: ${colors.text};
  background-color: ${colors.background};
  border: 1px solid ${colors.border};
  border-radius: ${radii.md};
  transition: border-color ${transitions.fast}, box-shadow ${transitions.fast};
  outline: none;

  &::placeholder {
    color: ${colors.textMuted};
  }

  &:focus {
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
    border-color: ${colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }

  &:disabled {
    background-color: ${colors.surface};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

export const Input = styled.input`
  ${baseInputStyles}
`;

export const TextArea = styled.textarea`
  ${baseInputStyles}
  resize: vertical;
  min-height: 80px;
`;
