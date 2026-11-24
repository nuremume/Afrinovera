export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> | undefined),
  };
  if (token) {
    mergedHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    ...rest,
    headers: mergedHeaders,
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const details = Array.isArray(payload.details) && payload.details.length > 0
      ? ` (${payload.details[0].field}: ${payload.details[0].message})`
      : '';
    throw new Error((payload.error || `Request failed (${res.status})`) + details);
  }
  return payload as T;
}
