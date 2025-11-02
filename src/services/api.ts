const BASE_URL = 'http://127.0.0.1:8000/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('accessToken');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Do not set Content-Type for FormData, the browser does it automatically with the boundary.
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Basic handling for unauthorized access. A real app would handle token refresh.
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.reload();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }
    
    if (response.status === 204) { // No Content successful responses
        return null;
    }

    return response.json();
  } catch (error) {
    console.error(`API Fetch Error: ${error}`);
    throw error;
  }
};
