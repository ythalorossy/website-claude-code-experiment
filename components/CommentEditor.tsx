'use client';

import { useRef, useState } from 'react';
import { RichTextEditor, RichTextEditorHandle } from '@/components/RichTextEditor';
import { Button } from '@/components/ui/Button';

interface CommentEditorProps {
  postId: string;
  onCommentAdded: (comment: Comment) => void;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export function CommentEditor({ postId, onCommentAdded }: CommentEditorProps) {
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  async function handleSubmit() {
    const html = editorRef.current?.getHTML() ?? '';
    if (!html.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content: html,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const comment = await response.json();
      setHasContent(false);
      onCommentAdded(comment);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <RichTextEditor
        ref={editorRef}
        toolbar="comment"
        onUpdate={(editor) => setHasContent(!editor.isEmpty)}
      />

      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !hasContent}
          size="sm"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </div>
  );
}
