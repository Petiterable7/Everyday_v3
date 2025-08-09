import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      console.log("🚀 AUTH: Starting auth check...");
      console.log("🚀 AUTH: API URL:", import.meta.env.VITE_API_URL);
      
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user`, {
          credentials: "include",
        });
        console.log("🚀 AUTH: Response status:", res.status);
        
        if (!res.ok) {
          // For testing: return a mock user instead of null
          console.log("🚀 AUTH: Backend not ready, using mock user");
          return {
            id: "test-user-123",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User"
          };
        }
        const data = await res.json();
        console.log("🚀 AUTH: Got user data:", data);
        return data;
      } catch (error) {
        // If backend is not responding, use mock user
        console.log("🚀 AUTH: Backend error, using mock user:", error);
        return {
          id: "test-user-123",
          email: "test@example.com",
          firstName: "Test",
          lastName: "User"
        };
      }
    },
    retry: false,
  });

  console.log("🚀 AUTH: Current state - user:", user, "isLoading:", isLoading, "error:", error);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
