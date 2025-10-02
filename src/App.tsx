import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import BookSlot from "./pages/BookSlot";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import Profile from "./pages/Profile";
import MyBookings from "./pages/MyBookings";
import OldSlotsPanel from "./pages/admin/OldSlotsPanel";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { useAuth } from "./context/AuthContext";

// Protected route component for non-admin users
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  // Move queryClient creation inside the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected routes for non-admin users */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/my-bookings" element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              } />
              <Route path="/book-slot" element={
                <ProtectedRoute>
                  <BookSlot />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={<Navigate to="/my-bookings" replace />} />
              <Route path="/new-user" element={<Navigate to="/profile" replace />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<Navigate to="/admin/slots" replace />} />
              <Route path="/admin/venues" element={<AdminPanel />} />
              <Route path="/admin/slots" element={<AdminPanel />} />
              <Route path="/admin/users" element={<AdminPanel />} />
              <Route path="/admin/settings" element={<AdminPanel />} />
              <Route path="/admin/payments" element={<AdminPanel />} />
              <Route path="/admin/old-slots" element={<OldSlotsPanel />} />
              
              {/* Public pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
