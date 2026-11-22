type CachedToken = {
  token: string;
  expiresAt: number;
};

let cachedToken: CachedToken | null = null;

// Clear the cached JWT when the user signs out so it cannot be reused.
export function clearAuthTokenCache() {
  cachedToken = null;
}

// Returns a Bearer token for the Express API. Falls back to an empty object
// if the user is signed out; the API then uses the session cookie instead.
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const now = Date.now();

  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return { Authorization: `Bearer ${cachedToken.token}` };
  }

  try {
    const response = await fetch("/api/auth-token", {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      cachedToken = null;
      return {};
    }

    const data = (await response.json()) as {
      token?: string;
      expiresAt?: number;
    };

    if (!data.token) {
      cachedToken = null;
      return {};
    }

    cachedToken = {
      token: data.token,
      expiresAt: data.expiresAt || now + 14 * 60 * 1000,
    };

    return { Authorization: `Bearer ${cachedToken.token}` };
  } catch {
    cachedToken = null;
    return {};
  }
}
