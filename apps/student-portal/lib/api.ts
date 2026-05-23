const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

/**
 * Simple fetch wrapper. No auth tokens needed.
 */
export async function api<T = unknown>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const { skipAuth, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  // Only set Content-Type for non-FormData requests
  if (!(rest.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers,
    });
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      window.dispatchEvent(new CustomEvent('network-error', { detail: 'Network interrupted. Please check your connection.' }));
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(response.status, error.message || 'Request failed', error.errors);
  }

  return response.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: { message: string }[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
