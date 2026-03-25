'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { forwardRef, useImperativeHandle } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';

type ToolbarConfig = 'comment' | 'post';

export interface RichTextEditorHandle {
  getHTML: () => string;
  isEmpty: () => boolean;
  setContent: (content: string) => void;
}

interface RichTextEditorProps {
  toolbar: ToolbarConfig;
  placeholder?: string;
  content?: string;
  className?: string;
  onUpdate?: (editor: Editor) => void;
}

const PLACEHOLDERS: Record<ToolbarConfig, string> = {
  comment: 'Write a comment...',
  post: 'Write your content...',
};

function ToolbarButton({
  onClick,
  isActive,
  title,
  children,
}: {
  onClick: () => void;
  isActive: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
        isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
      )}
      title={title}
    >
      {children}
    </button>
  );
}

function BoldIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m-2 0v16m-4 0h8" />
    </svg>
  );
}

function BulletListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  );
}

function HeadingIcon({ level }: { level: 1 | 2 }) {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {level === 1 ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6v12m12-12v12M4 6h16M12 6v12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h8m-8 4h8m-8 4h6" />
      )}
    </svg>
  );
}

function CodeBlockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function BlockquoteIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  (props, _ref) => {
    const { toolbar, placeholder, content = '', className, onUpdate } = props;
    const effectivePlaceholder = placeholder ?? PLACEHOLDERS[toolbar];

    const editor = useEditor({
      immediatelyRender: false,
      onUpdate: ({ editor: updatedEditor }) => onUpdate?.(updatedEditor),
      extensions: [
        StarterKit.configure({
          // Disable extensions for 'comment' variant; keep defaults for 'post'
          heading: toolbar === 'comment' ? false : undefined,
          codeBlock: toolbar === 'comment' ? false : undefined,
          blockquote: toolbar === 'comment' ? false : undefined,
          bulletList: toolbar === 'comment' ? false : undefined,
          orderedList: toolbar === 'comment' ? false : undefined,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-brand-600 dark:text-brand-400 underline',
          },
        }),
        Placeholder.configure({
          placeholder: effectivePlaceholder,
        }),
      ],
      content,
      editorProps: {
        attributes: {
          class: 'min-h-[100px] p-4 prose prose-sm dark:prose-invert focus:outline-none',
        },
      },
    });

    useImperativeHandle(_ref, () => ({
      getHTML: () => editor?.getHTML() ?? '',
      isEmpty: () => editor?.isEmpty ?? true,
      setContent: (content: string) => editor?.commands.setContent(content),
    }));

    if (!editor) {
      return null;
    }

    return (
      <div
        data-rich-text-editor
        className={cn('border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden', className)}
      >
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <BoldIcon />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <ItalicIcon />
          </ToolbarButton>

          {toolbar === 'post' && (
            <>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
              >
                <HeadingIcon level={1} />
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
              >
                <HeadingIcon level={2} />
              </ToolbarButton>
            </>
          )}

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <BulletListIcon />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <OrderedListIcon />
          </ToolbarButton>

          {toolbar === 'post' && (
            <>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive('codeBlock')}
                title="Code Block"
              >
                <CodeBlockIcon />
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Blockquote"
              >
                <BlockquoteIcon />
              </ToolbarButton>
            </>
          )}

          <ToolbarButton
            onClick={() => {
              const previousUrl = editor.getAttributes('link').href;
              const url = window.prompt('URL', previousUrl);
              if (url === null) return;
              if (url === '') {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
                return;
              }
              editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }}
            isActive={editor.isActive('link')}
            title="Link"
          >
            <LinkIcon />
          </ToolbarButton>
        </div>

        <EditorContent editor={editor} />
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
