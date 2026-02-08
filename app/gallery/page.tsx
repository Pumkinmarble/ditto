'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface GalleryEntry {
  id: string;
  name?: string | null;
  picture?: string | null;
  solana_tx_hash?: string | null;
  blockchain_committed_at?: string | null;
}

export default function GalleryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/gallery');
        const data = await res.json();
        if (data?.success && Array.isArray(data.entries)) {
          setEntries(data.entries);
        } else {
          setEntries([]);
        }
      } catch (error) {
        console.error('Failed to load gallery:', error);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="min-h-screen px-8 py-10" style={{ background: '#FFF8F0' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community Memorial Gallery</h1>
            <p className="text-sm text-gray-600 mt-1">
              Verified digital twins committed on Solana (Devnet)
            </p>
          </div>
          <button
            onClick={() => router.push('/home')}
            className="acrylic-button px-4 py-2 rounded-lg text-sm font-semibold text-gray-800"
            style={{ transform: 'none' }}
          >
            Back to Home
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading gallery…</div>
        ) : entries.length === 0 ? (
          <div className="text-sm text-gray-500">No public twins yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entries.map((entry) => {
              const dateLabel = entry.blockchain_committed_at
                ? new Date(entry.blockchain_committed_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
                : 'Unknown date';
              const displayName = entry.name || 'Anonymous';
              const signature = entry.solana_tx_hash || '';
              const shortSig = signature
                ? `${signature.slice(0, 6)}...${signature.slice(-6)}`
                : 'Missing signature';

              return (
                <div
                  key={entry.id}
                  className="rounded-2xl p-4 border border-black/[0.05] bg-white/70 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center text-orange-700 font-semibold">
                      {entry.picture ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={entry.picture} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{displayName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{displayName}</div>
                      <div className="text-xs text-gray-500">Committed {dateLabel}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs font-semibold text-gray-500 mb-1">Transaction</div>
                    {signature ? (
                      <a
                        href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-lg px-3 py-2 font-mono text-xs bg-black/[0.03] text-gray-700"
                      >
                        {shortSig}
                      </a>
                    ) : (
                      <div className="text-xs text-gray-400">No signature</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
