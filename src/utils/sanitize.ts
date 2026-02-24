/**
 * HTML sanitization utilities using DOMPurify
 * Provides strict XSS protection for rich text content
 */

import DOMPurify, { Config } from 'dompurify';

/**
 * Strict sanitization configuration
 * Allows basic formatting, lists, and links while stripping dangerous elements
 */
const SANITIZE_CONFIG: Config = {
  ALLOWED_TAGS: [
    'strong', 'b', 'em', 'i', 'u', 's', 'strike',
    'ul', 'ol', 'li',
    'p', 'br',
    'a',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
};

/**
 * Strips all style attributes to prevent XSS via CSS
 */
const SANITIZE_CONFIG_NO_STYLES: Config = {
  ...SANITIZE_CONFIG,
  ALLOWED_ATTR: ['href', 'target', 'rel'],
};

/**
 * Sanitizes HTML content for safe rendering
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(html, SANITIZE_CONFIG_NO_STYLES);
}

/**
 * Detects if content contains HTML tags (rich text)
 * @param content - Content to check
 * @returns true if content has HTML tags
 */
export function isRichText(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }

  // Check for HTML tag pattern
  const htmlPattern = /<[a-z][\s\S]*>/i;
  return htmlPattern.test(content);
}

/**
 * Escapes HTML entities for plain text display
 * Prevents plain text like "<b>" from rendering as bold
 * @param text - Plain text to escape
 * @returns Escaped text safe for HTML rendering
 */
export function escapePlainText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
