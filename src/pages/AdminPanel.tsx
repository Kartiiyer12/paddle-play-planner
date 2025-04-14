
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import AdminPanelContent from "@/components/admin/AdminPanelContent";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: isLoadingAuth } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!user) {
        toast.error("You must be logged in to access this page");
        navigate("/login");
        return;
      }

      if (!isAdmin) {
        toast.error("You do not have permission to access this page");
        navigate("/book-slot");
        return;
      }
    }
  }, [navigate, user, isAdmin, isLoadingAuth]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow pt-24 pb-24 px-4 bg-gray-50">
        <AdminPanelContent />
      </div>

      <Footer />
    </div>
  );
};

export default AdminPanel;
