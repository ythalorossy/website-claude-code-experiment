'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { RichTextEditorHandle } from '@/components/RichTextEditor';

const RichTextEditor = dynamic(
  () => import('@/components/RichTextEditor').then((m) => m.RichTextEditor),
  { ssr: false }
);

interface Translation {
  locale: string;
  title: string;
  content: string;
  excerpt?: string;
}

interface Post {
  title: string;
  content: string;
  excerpt?: string;
  translations: Translation[];
}

interface TranslationEditorProps {
  post: Post;
  postId: string;
}

const TRANSLATION_LOCALES = [
  { value: 'es', label: 'Spanish (ES)' },
  { value: 'pt', label: 'Portuguese (PT)' },
];

export function TranslationEditor({ post, postId }: TranslationEditorProps) {
  const [selectedLocale, setSelectedLocale] = useState('es');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const editorRef = useRef<RichTextEditorHandle>(null);

  const existingTranslation = post.translations.find((t) => t.locale === selectedLocale);

  useEffect(() => {
    const translation = post.translations.find((t) => t.locale === selectedLocale);
    setTitle(translation?.title || '');
    setExcerpt(translation?.excerpt || '');
    setContent(translation?.content || '');
    // Reset editor after locale change
    setTimeout(() => editorRef.current?.setContent(translation?.content || ''), 0);
  }, [selectedLocale, post.translations]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/posts/${postId}/translations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: selectedLocale, title, content, excerpt }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Translation saved!' });
        window.location.reload();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this translation?')) return;

    try {
      const response = await fetch(`/api/posts/${postId}/translations/${selectedLocale}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTitle('');
        setExcerpt('');
        setContent('');
        setMessage({ type: 'success', text: 'Translation deleted' });
        // Trigger refresh via router
        window.location.reload();
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete' });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Translations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Select
          label="Select Language"
          value={selectedLocale}
          options={TRANSLATION_LOCALES.map((l) => ({
            ...l,
            label: post.translations.some((t) => t.locale === l.value)
              ? `${l.label} (saved)`
              : l.label,
          }))}
          onChange={(e) => setSelectedLocale(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-6">
          {/* English source (read-only) */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">
              English Source (read-only)
            </h3>
            <Input label="Title" value={post.title} disabled />
            <Textarea label="Excerpt" value={post.excerpt || ''} disabled rows={2} />
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm max-h-64 overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
            </div>
          </div>

          {/* Translation fields */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">
              Translation ({selectedLocale.toUpperCase()})
            </h3>
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Translated title"
            />
            <Textarea
              label="Excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Translated excerpt"
              rows={2}
            />
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <RichTextEditor
                ref={editorRef}
                toolbar="post"
                placeholder="Translate content..."
                onUpdate={() => setContent(editorRef.current?.getHTML() || '')}
              />
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`rounded-md p-3 text-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={isSaving || !title || !content}>
            {isSaving ? 'Saving...' : 'Save Translation'}
          </Button>
          {existingTranslation && (
            <Button variant="outline" onClick={handleDelete}>
              Delete Translation
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}