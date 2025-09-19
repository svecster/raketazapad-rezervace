import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EntryPage } from "./components/auth/EntryPage";
import { RouteGuard } from "./components/auth/RouteGuard";
import { PlayerDashboard } from "./pages/player/PlayerDashboard";
import { StaffDashboard } from "./pages/staff/StaffDashboard";
import { OwnerDashboard } from "./pages/owner/OwnerDashboard";
import { GuestReservation } from "./pages/guest/GuestReservation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Entry page - always show first */}
          <Route path="/auth" element={<EntryPage />} />
          <Route path="/" element={<EntryPage />} />
          
          {/* Guest reservation */}
          <Route path="/rezervace/host" element={<GuestReservation />} />
          
          {/* Role-based dashboards */}
          <Route 
            path="/app/hrac" 
            element={
              <RouteGuard requireAuth={true} requiredRole="player">
                <PlayerDashboard />
              </RouteGuard>
            } 
          />
          <Route 
            path="/admin/obsluha" 
            element={
              <RouteGuard requireAuth={true} allowedRoles={['staff', 'owner']}>
                <StaffDashboard />
              </RouteGuard>
            } 
          />
          <Route 
            path="/admin/majitel" 
            element={
              <RouteGuard requireAuth={true} requiredRole="owner">
                <OwnerDashboard />
              </RouteGuard>
            } 
          />
          
          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
