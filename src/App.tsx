
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Header } from "./components/Header";
import Index from "./pages/Index";
import Demo from "./pages/Demo";
import Scorekeeper from "./pages/Scorekeeper";
import Spectator from "./pages/Spectator";
import Auth from "./pages/Auth";
import FieldManager from "./pages/FieldManager";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/spectator" element={<Spectator />} />
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
);

export default App;
