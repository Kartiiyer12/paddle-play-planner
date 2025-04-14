
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookSlot from "./pages/BookSlot";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import Profile from "./pages/Profile";
import MyBookings from "./pages/MyBookings";

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
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/book-slot" element={<BookSlot />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/venues" element={<AdminPanel />} />
              <Route path="/admin/slots" element={<AdminPanel />} />
              <Route path="/admin/users" element={<AdminPanel />} />
              <Route path="/admin/settings" element={<AdminPanel />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
