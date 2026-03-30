'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { CoinData } from '@/lib/crypto';

interface CoinsAdminClientProps {
  initialCoins: CoinData[];
}

/**
 * Raw API response shape — id is db cuid (used for API calls),
 * coinId is CoinCap ID (displayed in "CoinCap ID" column).
 */
interface CoinRow {
  id: string;
  symbol: string;
  name: string;
  coinId: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

/** Map CoinData (server shape, id=coincapId) to CoinRow for table display */
function toCoinRow(c: CoinData): CoinRow {
  return {
    id: `server-${c.id}`,
    symbol: c.symbol,
    name: c.name,
    coinId: c.id,
    color: c.color,
    isActive: c.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function CoinsAdminClient({ initialCoins }: CoinsAdminClientProps) {
  const [coins, setCoins] = useState<CoinRow[]>(initialCoins.map(toCoinRow));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoin, setEditingCoin] = useState<CoinRow | null>(null);
  const [deletingCoin, setDeletingCoin] = useState<CoinRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const refetchCoins = useCallback(async () => {
    const res = await fetch('/api/crypto/coins');
    const data = await res.json();
    // API returns Prisma Coin[] with coincapId field; CoinRow expects coinId.
    setCoins(
      (data.coins as { id: string; symbol: string; name: string; coincapId: string; color: string; isActive: boolean; createdAt: string; updatedAt: string }[]).map(
        (c) => ({ id: c.id, symbol: c.symbol, name: c.name, coinId: c.coincapId, color: c.color, isActive: c.isActive, createdAt: c.createdAt, updatedAt: c.updatedAt })
      )
    );
  }, []);

  async function handleAddCoin(formData: FormData) {
    setIsSubmitting(true);
    try {
      const body = {
        symbol: formData.get('symbol') as string,
        name: formData.get('name') as string,
        coincapId: formData.get('coincapId') as string,
        color: formData.get('color') as string,
      };
      const res = await fetch('/api/crypto/coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        addToast('error', err.error || 'Failed to add coin');
        return;
      }
      await refetchCoins();
      setShowAddModal(false);
      addToast('success', `${body.symbol} added successfully`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditCoin(formData: FormData) {
    if (!editingCoin) return;
    setIsSubmitting(true);
    try {
      const body: Record<string, unknown> = {};
      const symbol = formData.get('symbol');
      const name = formData.get('name');
      const coincapId = formData.get('coincapId');
      const color = formData.get('color');
      if (symbol) body.symbol = symbol;
      if (name) body.name = name;
      if (coincapId) body.coincapId = coincapId;
      if (color) body.color = color;

      const res = await fetch(`/api/crypto/coins/${editingCoin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        addToast('error', err.error || 'Failed to update coin');
        return;
      }
      await refetchCoins();
      setEditingCoin(null);
      addToast('success', 'Coin updated successfully');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(coin: CoinRow) {
    const res = await fetch(`/api/crypto/coins/${coin.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !coin.isActive }),
    });
    if (!res.ok) {
      addToast('error', 'Failed to toggle coin active status');
      return;
    }
    await refetchCoins();
    addToast('success', `${coin.symbol} ${!coin.isActive ? 'activated' : 'deactivated'}`);
  }

  async function handleDeleteCoin() {
    if (!deletingCoin) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/crypto/coins/${deletingCoin.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        addToast('error', err.error || 'Failed to delete coin');
        return;
      }
      await refetchCoins();
      setDeletingCoin(null);
      addToast('success', `${deletingCoin.symbol} deleted`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin" className="hover:text-gray-700">Admin</Link>
          <span>/</span>
          <Link href="/admin/crypto" className="hover:text-gray-700">Crypto</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100">Manage Coins</span>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Coins</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Add Coin
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">CoinCap ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Color</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Active</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-900 dark:divide-gray-700">
              {coins.map((coin) => (
                <tr key={coin.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {coin.symbol}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {coin.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {coin.coinId}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded"
                        style={{ backgroundColor: coin.color }}
                      />
                      <span className="text-sm text-gray-500">{coin.color}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(coin)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        coin.isActive !== false ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          coin.isActive !== false ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <button
                      onClick={() => setEditingCoin(coin)}
                      className="mr-3 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingCoin(coin)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {coins.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No coins found. Add your first coin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <Modal title="Add Coin" onClose={() => setShowAddModal(false)}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCoin(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Symbol</label>
                <input name="symbol" required placeholder="BTC" maxLength={10}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input name="name" required placeholder="Bitcoin" maxLength={50}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CoinCap ID</label>
                <input name="coincapId" required placeholder="bitcoin" maxLength={50}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                <div className="flex gap-2">
                  <input type="color" name="color" defaultValue="#f7931a"
                    className="h-10 w-20 rounded border border-gray-300 p-1 dark:border-gray-600" />
                  <input type="text" name="color" required placeholder="#f7931a" maxLength={7}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                  {isSubmitting ? 'Adding...' : 'Add Coin'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Edit Modal */}
        {editingCoin && (
          <Modal title={`Edit ${editingCoin.symbol}`} onClose={() => setEditingCoin(null)}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditCoin(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Symbol</label>
                <input name="symbol" defaultValue={editingCoin.symbol} required placeholder="BTC" maxLength={10}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input name="name" defaultValue={editingCoin.name} required placeholder="Bitcoin" maxLength={50}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CoinCap ID</label>
                <input name="coincapId" defaultValue={editingCoin.coinId} required placeholder="bitcoin" maxLength={50}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                <div className="flex gap-2">
                  <input type="color" name="color" defaultValue={editingCoin.color}
                    className="h-10 w-20 rounded border border-gray-300 p-1 dark:border-gray-600" />
                  <input type="text" name="color" defaultValue={editingCoin.color} required placeholder="#f7931a" maxLength={7}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingCoin(null)}
                  className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Confirmation */}
        {deletingCoin && (
          <Modal title="Delete Coin" onClose={() => setDeletingCoin(null)}>
            <p className="text-gray-700 dark:text-gray-300">
              Delete <strong>{deletingCoin.symbol}</strong> ({deletingCoin.name})? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setDeletingCoin(null)}
                className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400">
                Cancel
              </button>
              <button onClick={handleDeleteCoin} disabled={isSubmitting}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </Modal>
        )}

        {/* Toasts */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`rounded px-4 py-3 text-sm font-medium shadow-lg ${
                toast.type === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            &#10005;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
