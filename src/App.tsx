import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth system
import { AuthProvider } from "./auth/AuthProvider";
import { PrivateRoute, RoleRoute } from "./auth/guards";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Logout from "./pages/Logout";

// Admin pages
import AdminCalendar from "./pages/admin/AdminCalendar";
import Settings from "./pages/admin/Settings";
import Users from "./pages/admin/Users";

// Error pages
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";

// Legacy pages (keeping for compatibility)
import { EntryPage } from "./components/auth/EntryPage";
import { RouteGuard } from "./components/auth/RouteGuard";
import { PlayerDashboard } from "./pages/player/PlayerDashboard";
import { StaffDashboard } from "./pages/staff/StaffDashboard";
import { OwnerDashboard } from "./pages/owner/OwnerDashboard";
import { GuestReservation } from "./pages/guest/GuestReservation";
import { ReservantoReservation } from "./pages/ReservantoReservation";
import CheckoutPage from "./pages/CheckoutPage";
import { SetupOwner } from "./pages/SetupOwner";
import { ResetPassword } from "./pages/ResetPassword";

// Public pages
import { HomePage } from "./pages/HomePage";
import { PublicReservationPage } from "./pages/PublicReservationPage";
import { ServicesPage } from "./pages/ServicesPage";
import { PricingPage } from "./pages/PricingPage";
import { ContactPage } from "./pages/ContactPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          {/* Public website */}
          <Route path="/" element={<HomePage />} />
          <Route path="/sluzby" element={<ServicesPage />} />
          <Route path="/cenik" element={<PricingPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
          <Route path="/rezervace" element={<PublicReservationPage />} />
          
          {/* Auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />
          
          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            
            {/* Staff and above can access management */}
            <Route element={<RoleRoute allow={["staff","coach","admin","owner"]} />}>
              <Route path="/sprava" element={<AdminCalendar />} />
            </Route>
            
            {/* Admin and owner only */}
            <Route element={<RoleRoute allow={["admin","owner"]} />}>
              <Route path="/nastaveni" element={<Settings />} />
              <Route path="/uzivatele" element={<Users />} />
            </Route>
          </Route>
          
          {/* Error pages */}
          <Route path="/403" element={<Forbidden />} />
          
          {/* Auth and admin */}
          <Route path="/auth" element={<EntryPage />} />
          
          {/* Owner setup */}
          <Route path="/setup-owner" element={<SetupOwner />} />
          
          {/* Password reset */}
          <Route path="/reset-heslo" element={<ResetPassword />} />
          
          {/* Guest reservation */}
          <Route path="/rezervace/host" element={<GuestReservation />} />
          
          {/* Reservanto-style reservation */}
          <Route path="/rezervace/novy" element={<ReservantoReservation />} />
          
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
            path="/app/rezervace" 
            element={
              <RouteGuard requireAuth={true}>
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
            path="/admin/personal" 
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
          <Route 
            path="/admin/pokladna" 
            element={
              <RouteGuard requireAuth={true} allowedRoles={['staff', 'owner']}>
                <CheckoutPage />
              </RouteGuard>
            } 
          />
          
          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
