import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/Header";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Scorekeeper from "./pages/Scorekeeper";
import Spectator from "./pages/Spectator";
import FieldManager from "./pages/FieldManager";
import Analytics from "./pages/Analytics";
import AdminDashboard from "./pages/AdminDashboard";
import Demo from "./pages/Demo";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Enhanced routing component to handle hash-based and QR code routing
const EnhancedRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      console.log('Hash change detected:', hash);
      
      if (hash.includes('#spectator')) {
        // Extract parameters from hash
        const hashParams = hash.substring(1); // Remove #
        if (hashParams.includes('?')) {
          const [route, queryString] = hashParams.split('?');
          if (route === 'spectator') {
            console.log('Navigating to spectator with query:', queryString);
            navigate(`/spectator?${queryString}`);
          }
        } else if (hashParams === 'spectator') {
          navigate('/spectator');
        }
      } else if (hash.includes('#field/')) {
        // Handle field-specific routing
        const fieldMatch = hash.match(/#field\/([a-zA-Z0-9-]+)/);
        if (fieldMatch) {
          const fieldId = fieldMatch[1];
          console.log('Navigating to field:', fieldId);
          navigate(`/field/${fieldId}`);
        }
      }
    };

    // Check hash on component mount and URL changes
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [navigate]);

  // Handle QR code scan redirects
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const qrField = urlParams.get('field');
    const qrGame = urlParams.get('gameId');
    
    if (qrField && location.pathname === '/') {
      // Redirect QR code scans to spectator view
      if (qrGame) {
        navigate(`/spectator/${qrGame}?field=${qrField}`);
      } else {
        navigate(`/spectator?field=${qrField}`);
      }
    }
  }, [location, navigate]);

  return null;
};

// Service Worker registration
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker available');
              // Optionally show update notification
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

const App = () => {
  useEffect(() => {
    registerServiceWorker();
    
    // Add analytics tracking
    const trackPageView = () => {
      // Log page views for analytics
      console.log('Page view:', window.location.pathname);
    };
    
    trackPageView();
    window.addEventListener('popstate', trackPageView);
    
    return () => {
      window.removeEventListener('popstate', trackPageView);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <EnhancedRouter />
              <div className="min-h-screen bg-gray-50">
                <Header />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/spectator" element={<Spectator />} />
                  <Route path="/spectator/:gameId" element={<Spectator />} />
                  <Route path="/field/:fieldId" element={<Spectator />} />
                  
                  {/* Protected Routes */}
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
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch-all route - MUST be last */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
