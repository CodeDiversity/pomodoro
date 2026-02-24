/**
 * RichTextDisplay - Read-only rendering of sanitized HTML notes
 * Safely displays rich text or plain text content with XSS protection
 */

import React from 'react';
import styled from 'styled-components';
import { colors } from './ui/theme';
import { sanitizeHtml, isRichText, escapePlainText } from '../utils/sanitize';

interface RichTextDisplayProps {
  /** HTML string or plain text content */
  content: string;
  /** Optional className for custom styling */
  className?: string;
}

const DisplayContainer = styled.div<{ $isRichText: boolean }>`
  font-family: inherit;
  line-height: 1.6;
  color: ${colors.text};
  white-space: pre-wrap;
  word-break: break-word;

  /* Rich text styling */
  ${({ $isRichText }) =>
    $isRichText &&
    `
    a {
      color: ${colors.primary};
      text-decoration: none;
      transition: color 150ms ease;

      &:hover {
        text-decoration: underline;
      }
    }

    p {
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    ul, ol {
      padding-left: 24px;
      margin-bottom: 8px;
    }

    li {
      margin-bottom: 4px;
    }

    strong, b {
      font-weight: 600;
    }

    em, i {
      font-style: italic;
    }

    s, strike {
      text-decoration: line-through;
    }
  `}
`;

/**
 * Renders content as sanitized HTML (if rich text) or escaped plain text
 * Automatically detects content type and applies appropriate rendering
 */
export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({
  content,
  className,
}) => {
  // Handle empty content
  if (!content || content.trim() === '') {
    return null;
  }

  const richText = isRichText(content);

  if (richText) {
    // Sanitize and render HTML
    const sanitized = sanitizeHtml(content);

    return (
      <DisplayContainer
        className={className}
        $isRichText={true}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  // Escape and render plain text
  const escaped = escapePlainText(content);

  return (
    <DisplayContainer
      className={className}
      $isRichText={false}
    >
      {escaped.split('\n').map((line, index, arr) => (
        <React.Fragment key={index}>
          {line}
          {index < arr.length - 1 && <br />}
        </React.Fragment>
      ))}
    </DisplayContainer>
  );
};

export default RichTextDisplay;
