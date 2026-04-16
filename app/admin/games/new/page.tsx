'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const GENRE_OPTIONS = ['RPG', 'FPS', 'Puzzle', 'Platformer', 'Strategy', 'Adventure', 'Simulation', 'Sports', 'Horror', 'Other'];
const PLATFORM_OPTIONS = ['PC', 'Mobile', 'Web', 'Console', 'Nintendo Switch', 'PlayStation', 'Xbox'];
const ENGINE_OPTIONS = ['Unity', 'Unreal', 'Godot', 'Phaser', 'GameMaker', 'Construct', 'Custom', 'Other'];

export default function NewGamePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    playUrl: '',
    itchUrl: '',
    status: true,
    startDate: '',
    endDate: '',
  });

  const [genre, setGenre] = useState<string[]>([]);
  const [platform, setPlatform] = useState<string[]>([]);
  const [engine, setEngine] = useState<string[]>([]);

  const toggleArrayField = (field: 'genre' | 'platform' | 'engine', value: string) => {
    const setValues = field === 'genre' ? setGenre : field === 'platform' ? setPlatform : setEngine;
    const values = field === 'genre' ? genre : field === 'platform' ? platform : engine;
    if (values.includes(value)) {
      setValues(values.filter((v) => v !== value));
    } else {
      setValues([...values, value]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, genre, platform, engine }),
      });
      if (!res.ok) throw new Error('Failed to create game');
      router.push('/admin/games');
      router.refresh();
    } catch (err) {
      setError('Failed to create game');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/games"
          className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Games
        </Link>
        <h1 className="text-3xl font-bold">Add Game</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-slate-900">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="title" className="mb-1 block text-sm font-medium">Title *</label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="mb-1 block text-sm font-medium">Description *</label>
            <textarea
              id="description"
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="image" className="mb-1 block text-sm font-medium">Image URL</label>
            <input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/game-image.jpg"
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label htmlFor="playUrl" className="mb-1 block text-sm font-medium">Play URL</label>
            <input
              id="playUrl"
              type="url"
              value={formData.playUrl}
              onChange={(e) => setFormData({ ...formData, playUrl: e.target.value })}
              placeholder="https://play.example.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label htmlFor="itchUrl" className="mb-1 block text-sm font-medium">Itch.io URL</label>
            <input
              id="itchUrl"
              type="url"
              value={formData.itchUrl}
              onChange={(e) => setFormData({ ...formData, itchUrl: e.target.value })}
              placeholder="https://example.itch.io"
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label htmlFor="startDate" className="mb-1 block text-sm font-medium">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="mb-1 block text-sm font-medium">End Date</label>
            <input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div className="md:col-span-2" role="group" aria-labelledby="genre-label">
            <label id="genre-label" className="mb-2 block text-sm font-medium">Genre</label>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((option) => (
                <label
                  key={option}
                  htmlFor={`genre-${option}`}
                  className={`cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    genre.includes(option)
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 border border-brand-300 dark:border-brand-700'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    id={`genre-${option}`}
                    type="checkbox"
                    className="sr-only"
                    checked={genre.includes(option)}
                    onChange={() => toggleArrayField('genre', option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2" role="group" aria-labelledby="platform-label">
            <label id="platform-label" className="mb-2 block text-sm font-medium">Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((option) => (
                <label
                  key={option}
                  htmlFor={`platform-${option}`}
                  className={`cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    platform.includes(option)
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 border border-brand-300 dark:border-brand-700'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    id={`platform-${option}`}
                    type="checkbox"
                    className="sr-only"
                    checked={platform.includes(option)}
                    onChange={() => toggleArrayField('platform', option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2" role="group" aria-labelledby="engine-label">
            <label id="engine-label" className="mb-2 block text-sm font-medium">Engine</label>
            <div className="flex flex-wrap gap-2">
              {ENGINE_OPTIONS.map((option) => (
                <label
                  key={option}
                  htmlFor={`engine-${option}`}
                  className={`cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    engine.includes(option)
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 border border-brand-300 dark:border-brand-700'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    id={`engine-${option}`}
                    type="checkbox"
                    className="sr-only"
                    checked={engine.includes(option)}
                    onChange={() => toggleArrayField('engine', option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex items-center">
            <label htmlFor="status" className="flex items-center gap-2">
              <input
                id="status"
                type="checkbox"
                checked={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/games"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Game'}
          </button>
        </div>
      </form>
    </div>
  );
}
