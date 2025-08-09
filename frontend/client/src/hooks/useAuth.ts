import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user`, {
        credentials: "include",
      });
      
      if (!res.ok) {
        return null; // Not authenticated
      }
      
      return res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
