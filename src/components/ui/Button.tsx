import styled, { css } from 'styled-components';
import { colors, radii, transitions } from './theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  $variant?: ButtonVariant;
  $size?: ButtonSize;
  $fullWidth?: boolean;
}

const variantStyles = {
  primary: css`
    background-color: ${colors.primary};
    color: white;
    border: none;

    &:hover:not(:disabled) {
      background-color: ${colors.primaryHover};
    }
  `,
  secondary: css`
    background-color: ${colors.secondary};
    color: white;
    border: none;

    &:hover:not(:disabled) {
      background-color: #444444;
    }
  `,
  ghost: css`
    background-color: transparent;
    color: ${colors.text};
    border: 1px solid ${colors.border};

    &:hover:not(:disabled) {
      background-color: ${colors.surface};
      border-color: ${colors.textMuted};
    }
  `,
  danger: css`
    background-color: ${colors.error};
    color: white;
    border: none;

    &:hover:not(:disabled) {
      background-color: #c53030;
    }
  `,
};

const sizeStyles = {
  sm: css`
    padding: 6px 12px;
    font-size: 13px;
  `,
  md: css`
    padding: 8px 16px;
    font-size: 14px;
  `,
  lg: css`
    padding: 12px 24px;
    font-size: 16px;
  `,
};

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: ${radii.md};
  font-weight: 500;
  cursor: pointer;
  transition: all ${transitions.normal};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  ${({ $variant = 'primary' }) => variantStyles[$variant]}
  ${({ $size = 'md' }) => sizeStyles[$size]}

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps> = ({
  children,
  ...props
}) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};
