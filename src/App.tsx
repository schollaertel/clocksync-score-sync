import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/Header";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Scorekeeper from "./pages/Scorekeeper";
import Spectator from "./pages/Spectator";
import FieldManager from "./pages/FieldManager";
import Demo from "./pages/Demo";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Component to handle hash-based routing
const HashRouter = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('#spectator')) {
        // Extract parameters from hash
        const hashParams = hash.substring(1); // Remove #
        if (hashParams.includes('?')) {
          const [route, queryString] = hashParams.split('?');
          if (route === 'spectator') {
            // Navigate to spectator with query parameters
            navigate(`/spectator?${queryString}`);
          }
        } else if (hashParams === 'spectator') {
          navigate('/spectator');
        }
      }
    };

    // Check hash on component mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [navigate]);

  return null; // This component only handles routing logic
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <HashRouter />
            <div className="min-h-screen bg-gray-50">
              <Header />
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/spectator" element={<Spectator />} />
                <Route path="/spectator/:gameId" element={<Spectator />} />
                <Route path="/field/:fieldId" element={<Spectator />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/demo" element={
                  <ProtectedRoute>
                    <Demo />
                  </ProtectedRoute>
                } />
                <Route path="/scorekeeper" element={
                  <ProtectedRoute>
                    <Scorekeeper />
                  </ProtectedRoute>
                } />
                <Route path="/fields" element={
                  <ProtectedRoute>
                    <FieldManager />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
