import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./lib/ThemeContext";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "../src/components/ui/sonner.tsx";
// import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "../src/components/ui/tooltip.tsx";
import Index from "../src/pages/Index.tsx";
import NotFound from "../src/pages/NotFound.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import Dashboard from "./pages/dashboard.tsx";
import Page from "./pages/dashboard1.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import CircularTestimonialsDemo from "./pages/circular-testimonials-demo.tsx";
import TracingBeamDemo from "./components/tracing-beam-demo.tsx";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dash" element={<ProtectedRoute><Page /></ProtectedRoute>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/testimonials" element={<CircularTestimonialsDemo />} />
          <Route path="/tracing-beam" element={<TracingBeamDemo />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
