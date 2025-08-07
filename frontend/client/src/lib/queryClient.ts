import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401s
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// Get API base URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Default fetcher function for React Query
export const defaultQueryFn = async ({ queryKey }: { queryKey: string[] }) => {
  const url = API_BASE_URL + queryKey[0];
  const response = await fetch(url, {
    credentials: 'include', // Important for session cookies
  });
  
  if (!response.ok) {
    const error = new Error('Network response was not ok') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  
  return response.json();
};

// Set default query function
queryClient.setDefaultOptions({
  queries: {
    queryFn: defaultQueryFn,
  },
});

// API request helper for mutations
export async function apiRequest(method: string, url: string, data?: any) {
  const fullUrl = API_BASE_URL + url;
  
  const response = await fetch(fullUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for session cookies
    ...(data && { body: JSON.stringify(data) }),
  });

  if (!response.ok) {
    const error = new Error('Network response was not ok') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return response;
}