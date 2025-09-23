import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth system
import { AuthProvider } from "./auth/AuthProvider";
import { PrivateRoute, RoleRoute } from "./auth/guards";

// Layouts
import { PublicLayout } from "./components/layout/PublicLayout";
import { AppLayout } from "./components/layout/AppLayout";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Logout from "./pages/Logout";

// Error pages
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";

// Public pages
import { HomePage } from "./pages/HomePage";
import { ServicesPage } from "./pages/ServicesPage";
import { PricingPage } from "./pages/PricingPage";
import { ContactPage } from "./pages/ContactPage";

// App pages - Core
import { AppReservationPage } from "./pages/app/AppReservationPage";
import { MyReservationsPage } from "./pages/app/MyReservationsPage";
import { PaymentHistoryPage } from "./pages/app/PaymentHistoryPage";
import { ProfilePage } from "./pages/app/ProfilePage";

// App pages - Staff
import { StaffDashboardPage } from "./pages/app/staff/StaffDashboardPage";
import { StaffReservationsPage } from "./pages/app/staff/StaffReservationsPage";
import { StaffCashRegisterPage } from "./pages/app/staff/StaffCashRegisterPage";
import { StaffShiftsPage } from "./pages/app/staff/StaffShiftsPage";
import { StaffClientsPage } from "./pages/app/staff/StaffClientsPage";

// App pages - Owner
import { OwnerDashboardPage } from "./pages/app/owner/OwnerDashboardPage";
import { OwnerPricingPage } from "./pages/app/owner/OwnerPricingPage";
import { OwnerInventoryPage } from "./pages/app/owner/OwnerInventoryPage";
import { OwnerFinancePage } from "./pages/app/owner/OwnerFinancePage";

// App pages - Trainer
import { TrainerCalendarPage } from "./pages/app/trainer/TrainerCalendarPage";
import { TrainerPayoutsPage } from "./pages/app/trainer/TrainerPayoutsPage";

// App pages - Admin
import { AdminPage } from "./pages/app/admin/AdminPage";

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
            <Route element={<RoleRoute allow={["staff","owner"]} />}>
              <Route path="/sprava" element={<ManagementPage />} />
              <Route path="/admin/pokladna" element={<CheckoutPage />} />
              <Route path="/pokladna" element={<PosPage />} />
              <Route path="/sklad" element={<StockPage />} />
            </Route>
            
            {/* Owner only */}
            <Route element={<RoleRoute allow={["owner"]} />}>
              <Route path="/nastaveni" element={<Settings />} />
              <Route path="/uzivatele" element={<Users />} />
              <Route path="/inventury" element={<InventoryPage />} />
              <Route path="/reporty" element={<ReportsPage />} />
              <Route path="/nastaveni/pokladna" element={<PosSettingsPage />} />
            </Route>
          </Route>
          
          {/* Legacy redirects */}
          
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
