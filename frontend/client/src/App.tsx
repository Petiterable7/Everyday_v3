import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";

function AppContent() {
  console.log("🚀 APP: AppContent starting...");
  const { user, isLoading } = useAuth();
  
  console.log("🚀 APP: Auth state - user:", user, "isLoading:", isLoading);
  
  if (isLoading) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
        <h1 style={{ color: 'red' }}>🚀 DEBUG: App is loading!</h1>
        <p>If you see this, the React app is working!</p>
        <div style={{ color: 'purple', marginTop: '20px' }}>Loading authentication...</div>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1 style={{ color: 'red' }}>🚀 DEBUG: App is loading!</h1>
      <p>If you see this, the React app is working!</p>
      <div style={{ color: 'green', marginBottom: '20px' }}>✅ Auth loaded! User: {user?.firstName || 'Test User'}</div>
      <Home />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
