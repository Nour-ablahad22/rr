import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { env } from '@/config/env';
import { apiFetch } from '@/services/apiClient';

const STORAGE_KEY = 'nrw-explorer:favoriten';
const USER_KEY = 'nrw-explorer:gast-id';

interface FavoritesContextValue {
  ids: string[];
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function readStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function guestId(): string {
  try {
    let id = localStorage.getItem(USER_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(USER_KEY, id);
    }
    return id;
  } catch {
    return 'gast';
  }
}

/**
 * Favoriten ohne Registrierung: Speicherung im localStorage.
 * Im API-Modus werden Änderungen zusätzlich mit einer anonymen Gast-ID an /api/favorites gesendet.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => readStorage());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* Speicher nicht verfügbar (z. B. privater Modus) – Favoriten bleiben für die Sitzung erhalten */
    }
  }, [ids]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && setIds(readStorage());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const sync = useCallback((id: string, add: boolean) => {
    if (env.dataSource !== 'api') return;
    const userId = guestId();
    const req = add
      ? apiFetch('/favorites', { method: 'POST', body: JSON.stringify({ userId, attractionId: id }) })
      : apiFetch(`/favorites/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' });
    req.catch((err) => console.warn('Favoriten-Synchronisierung fehlgeschlagen', err));
  }, []);

  const toggle = useCallback(
    (id: string) =>
      setIds((prev) => {
        const add = !prev.includes(id);
        sync(id, add);
        return add ? [...prev, id] : prev.filter((x) => x !== id);
      }),
    [sync],
  );
  const remove = useCallback(
    (id: string) =>
      setIds((prev) => {
        sync(id, false);
        return prev.filter((x) => x !== id);
      }),
    [sync],
  );
  const clear = useCallback(() => setIds([]), []);

  const value = useMemo(() => ({ ids, isFavorite: (id: string) => ids.includes(id), toggle, remove, clear }), [ids, toggle, remove, clear]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites muss innerhalb von FavoritesProvider verwendet werden');
  return ctx;
}
