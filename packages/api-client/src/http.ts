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

// Re-export or redefine to match utils, or extend
export interface ApiError {
  status: number;
  statusText?: string;
  message: string;
  code?: string;
  errors?: any[];
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

    if (res.status === 204) return undefined as unknown as T;

    // Try to parse JSON
    let body: any;
    const text = await res.text();
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      // If not JSON, but error status, throw text
      if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText} - ${text}`);
      // If OK but not JSON, return strict text? But T implies data.
      return text as unknown as T;
    }

    // Check for ApiResponse structure
    const isApiResponse = body && typeof body === 'object' && typeof body.success === 'boolean';

    if (!res.ok) {
      if (isApiResponse && !body.success) {
        throw new Error(body.message || 'Request failed');
      }
      throw new Error(body.error || body.message || `Request failed: ${res.status}`);
    }

    if (isApiResponse) {
      if (!body.success) {
        // Logical error despite 200 OK? Should not happen with standard usage but safety check
        throw new Error(body.message || 'Request failed');
      }
      return body.data as T;
    }

    return body as T;
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

    if (res.status === 204) return undefined as unknown as T;

    let body: any;
    const text = await res.text();
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      if (!res.ok) {
        const message = `${method} ${path} failed: ${res.status} ${res.statusText} - ${text}`;
        const error: ApiError = { status: res.status, statusText: res.statusText, message };
        this.opts.onError?.(error);
        throw new Error(message);
      }
      return text as unknown as T;
    }

    const isApiResponse = body && typeof body === 'object' && typeof body.success === 'boolean';

    if (!res.ok) {
      let message = `${method} ${path} failed: ${res.status}`;
      let detailedErrors: any[] | undefined;

      if (isApiResponse && !body.success) {
        message = body.message || message;
        detailedErrors = body.errors; // Capture errors from ApiResponse
      } else {
        message = body.error || body.message || message;
      }

      const error: ApiError = {
        status: res.status,
        statusText: res.statusText,
        message,
        errors: detailedErrors,
      };
      this.opts.onError?.(error);
      throw new Error(message);
    }

    // Success case
    if (isApiResponse) {
      return body.data as T;
    }

    return body as T;
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
