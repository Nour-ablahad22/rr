import { env } from '@/config/env';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Zentraler HTTP-Client für die Azure-Functions-API mit Timeout und einheitlicher Fehlerbehandlung. */
export async function apiFetch<T>(path: string, init: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), init.timeoutMs ?? 10000);
  try {
    const res = await fetch(`${env.apiBaseUrl}${path}`, {
      ...init,
      signal: init.signal ?? controller.signal,
      headers: { Accept: 'application/json', ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
    });
    if (!res.ok) {
      let message = `Anfrage fehlgeschlagen (${res.status})`;
      let code: string | undefined;
      try {
        const body = (await res.json()) as { error?: { message?: string; code?: string } };
        message = body.error?.message ?? message;
        code = body.error?.code;
      } catch {
        /* keine JSON-Antwort */
      }
      throw new ApiError(message, res.status, code);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if ((err as Error).name === 'AbortError') throw new ApiError('Zeitüberschreitung bei der Anfrage', 408, 'TIMEOUT');
    throw new ApiError('Der Server ist derzeit nicht erreichbar.', 0, 'NETWORK');
  } finally {
    clearTimeout(timer);
  }
}
