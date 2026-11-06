const API_BASE = '';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('politix_token');
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default content-type is json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Download blob helper (e.g. for CSV exports)
export async function downloadFile(endpoint: string, filename: string): Promise<void> {
  const token = localStorage.getItem('politix_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, { headers });
  if (!response.ok) {
    throw new Error('Failed to download file');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
