import { Session } from '@campus-os/types';

export interface ApiClientOptions {
  baseUrl: string;
  getSession?: () => Promise<Session | null> | Session | null;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getSession?: ApiClientOptions['getSession'];

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.getSession = options.getSession;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const session = this.getSession ? await this.getSession() : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(init.headers as Record<string, string> | undefined)
    };

    const res = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Request failed: ${res.status} ${res.statusText} - ${text}`);
    }
    if (res.status === 204) return undefined as unknown as T;
    return (await res.json()) as T;
  }
}
export type HttpOptions = {
  baseUrl: string;
  getToken?: () => Promise<string | undefined> | string | undefined;
};

export class HttpClient {
  constructor(private opts: HttpOptions) {}

  private async headers(extra?: HeadersInit) {
    const h: HeadersInit = { 'Content-Type': 'application/json', ...(extra || {}) };
    const token = await this.opts.getToken?.();
    if (token) (h as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    return h;
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(new URL(path, this.opts.baseUrl), { headers: await this.headers() });
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return (await res.json()) as T;
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(new URL(path, this.opts.baseUrl), {
      method: 'POST',
      headers: await this.headers(),
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
    return (await res.json()) as T;
  }
}
