/**
 * RichTextEditor - Editable rich text editor with toolbar
 * Provides Bold, Bullet List, and Link formatting for session notes
 */

import React from 'react';
import styled from 'styled-components';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { colors, radii } from './ui/theme';

interface RichTextEditorProps {
  /** HTML string or plain text content */
  content: string;
  /** Callback when content changes, returns HTML string */
  onChange: (html: string) => void;
}

const EditorWrapper = styled.div`
  border: 1px solid ${colors.border};
  border-radius: ${radii.lg};
  overflow: hidden;
  background: ${colors.surface};
`;

const Toolbar = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid ${colors.border};
  background: white;
`;

const ToolbarButton = styled.button<{ $isActive: boolean }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $isActive }) => $isActive ? '#e2e8f0' : 'transparent'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: ${colors.textMuted};
  transition: background-color 150ms ease;

  &:hover {
    background-color: #f1f5f9;
  }

  &:focus {
    outline: 2px solid ${colors.primary};
    outline-offset: 1px;
  }
`;

const EditorArea = styled.div`
  .tiptap {
    min-height: 160px;
    padding: 16px;
    font-family: inherit;
    font-size: 0.9rem;
    line-height: 1.6;
    color: ${colors.text};

    &:focus {
      outline: none;
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

    a {
      color: ${colors.primary};
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    strong, b {
      font-weight: 600;
    }
  }
`;

// Inline SVG Icons
const BoldIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
  </svg>
);

const ListIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const LinkIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

/**
 * Rich text editor with toolbar supporting Bold, Bullet List, and Link formatting
 * Outputs HTML string via onChange callback for storage
 */
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleLinkClick = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl || 'https://');

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <EditorWrapper>
      <Toolbar>
        <ToolbarButton
          $isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
          type="button"
        >
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton
          $isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
          type="button"
        >
          <ListIcon />
        </ToolbarButton>
        <ToolbarButton
          $isActive={editor.isActive('link')}
          onClick={handleLinkClick}
          title="Link"
          type="button"
        >
          <LinkIcon />
        </ToolbarButton>
      </Toolbar>
      <EditorArea>
        <EditorContent editor={editor} />
      </EditorArea>
    </EditorWrapper>
  );
};

export default RichTextEditor;
