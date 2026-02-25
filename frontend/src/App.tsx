import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ExplorePage from "./pages/ExplorePage";
import CycleDetailPage from "./pages/CycleDetailPage";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminContent from "./pages/admin/AdminContent";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSettings from "./pages/admin/AdminSettings";
import PublicLayout from "./components/PublicLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>

          {/* PUBLIC LAYOUT WRAPPER */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/cycle/:slug" element={<CycleDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* ADMIN LAYOUT */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
