import { Session } from '@campus-os/types';

// ============================================================================
// Types
// ============================================================================

export interface ApiClientOptions {
  baseUrl: string;
  getSession?: () => Promise<Session | null> | Session | null;
  onUnauthorized?: () => void | Promise<void>;
}

export interface HttpOptions {
  baseUrl: string;
  getToken?: () => Promise<string | undefined> | string | undefined;
  onUnauthorized?: () => void | Promise<void>;
  onError?: (error: ApiError) => void;
}

export interface ApiError {
  status: number;
  statusText: string;
  message: string;
  code?: string;
}

// ============================================================================
// ApiClient Class (Session-based)
// ============================================================================

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getSession?: ApiClientOptions['getSession'];
  private readonly onUnauthorized?: ApiClientOptions['onUnauthorized'];

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.getSession = options.getSession;
    this.onUnauthorized = options.onUnauthorized;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const session = this.getSession ? await this.getSession() : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...(init.headers as Record<string, string> | undefined),
    };

    const res = await fetch(`${this.baseUrl}${path}`, { ...init, headers });

    if (res.status === 401) {
      await this.onUnauthorized?.();
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Request failed: ${res.status} ${res.statusText} - ${text}`);
    }

    if (res.status === 204) return undefined as unknown as T;
    return (await res.json()) as T;
  }
}

// ============================================================================
// HttpClient Class (Token-based)
// ============================================================================

export class HttpClient {
  constructor(private opts: HttpOptions) {}

  private async headers(extra?: HeadersInit): Promise<HeadersInit> {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(extra as Record<string, string> | undefined),
    };
    const token = await this.opts.getToken?.();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  private async handleResponse<T>(res: Response, method: string, path: string): Promise<T> {
    if (res.status === 401) {
      await this.opts.onUnauthorized?.();
      const error: ApiError = {
        status: 401,
        statusText: 'Unauthorized',
        message: 'Authentication required',
        code: 'UNAUTHORIZED',
      };
      this.opts.onError?.(error);
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      let message = `${method} ${path} failed: ${res.status}`;
      try {
        const data = await res.json();
        message = data.error || data.message || message;
      } catch {
        // Ignore JSON parse error
      }
      const error: ApiError = {
        status: res.status,
        statusText: res.statusText,
        message,
      };
      this.opts.onError?.(error);
      throw new Error(message);
    }

    if (res.status === 204) return undefined as unknown as T;
    return (await res.json()) as T;
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(new URL(path, this.opts.baseUrl), {
      headers: await this.headers(),
    });
    return this.handleResponse<T>(res, 'GET', path);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(new URL(path, this.opts.baseUrl), {
      method: 'POST',
      headers: await this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(res, 'POST', path);
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(new URL(path, this.opts.baseUrl), {
      method: 'PUT',
      headers: await this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(res, 'PUT', path);
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(new URL(path, this.opts.baseUrl), {
      method: 'PATCH',
      headers: await this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(res, 'PATCH', path);
  }

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(new URL(path, this.opts.baseUrl), {
      method: 'DELETE',
      headers: await this.headers(),
    });
    return this.handleResponse<T>(res, 'DELETE', path);
  }
}
