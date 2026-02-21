import styled from 'styled-components';
import { colors, radii, transitions, spacing } from './theme';

export const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.xs} ${spacing.sm};
  font-size: 12px;
  font-weight: 500;
  color: white;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%);
  border-radius: 16px;
  transition: transform ${transitions.fast}, box-shadow ${transitions.fast};
  user-select: none;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }
`;

export const ChipRemoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  margin-left: 2px;
  font-size: 14px;
  line-height: 1;
  color: white;
  background: transparent;
  border: none;
  border-radius: ${radii.full};
  cursor: pointer;
  opacity: 0.7;
  transition: opacity ${transitions.fast};

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid white;
    outline-offset: 1px;
  }
`;
