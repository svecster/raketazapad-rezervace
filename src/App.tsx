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

// POS pages
import PosPage from "./pages/pos/PosPage";
import StockPage from "./pages/pos/StockPage";
import InventoryPage from "./pages/pos/InventoryPage";
import ReportsPage from "./pages/pos/ReportsPage";
import PosSettingsPage from "./pages/pos/PosSettingsPage";

// Error pages
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";

// Core pages
import { Navigate } from "react-router-dom";
import { ReservationPage } from "./pages/ReservationPage";
import { ManagementPage } from "./pages/ManagementPage";
import CheckoutPage from "./pages/CheckoutPage";
import { MyReservationsPage } from "./pages/MyReservationsPage";
import { PaymentHistoryPage } from "./pages/PaymentHistoryPage";

// Public pages
import { HomePage } from "./pages/HomePage";
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
          <Route path="/rezervace" element={<ReservationPage />} />
          
          {/* Auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />
          
          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/moje-rezervace" element={<MyReservationsPage />} />
            <Route path="/platby" element={<PaymentHistoryPage />} />
            
            {/* Staff and above can access management and POS */}
            <Route element={<RoleRoute allow={["staff","coach","admin","owner"]} />}>
              <Route path="/sprava" element={<ManagementPage />} />
              <Route path="/admin/pokladna" element={<CheckoutPage />} />
              <Route path="/pokladna" element={<PosPage />} />
              <Route path="/sklad" element={<StockPage />} />
            </Route>
            
            {/* Admin and owner only */}
            <Route element={<RoleRoute allow={["admin","owner"]} />}>
              <Route path="/nastaveni" element={<Settings />} />
              <Route path="/uzivatele" element={<Users />} />
              <Route path="/inventury" element={<InventoryPage />} />
              <Route path="/reporty" element={<ReportsPage />} />
              <Route path="/nastaveni/pokladna" element={<PosSettingsPage />} />
            </Route>
          </Route>
          
          {/* Legacy redirects */}
          <Route path="/app/hrac" element={<Navigate to="/profile" replace />} />
          <Route path="/app/rezervace" element={<Navigate to="/profile" replace />} />
          <Route path="/admin/obsluha" element={<Navigate to="/sprava" replace />} />
          <Route path="/admin/personal" element={<Navigate to="/sprava" replace />} />
          <Route path="/admin/majitel" element={<Navigate to="/nastaveni" replace />} />
          <Route path="/rezervace/novy" element={<Navigate to="/rezervace" replace />} />
          <Route path="/rezervace/verejne" element={<Navigate to="/rezervace" replace />} />
          
          {/* Error pages */}
          <Route path="/403" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
