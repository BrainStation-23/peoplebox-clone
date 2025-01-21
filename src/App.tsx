import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminLayout from "./components/layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminConfig from "./pages/admin/Config";
import AdminProfile from "./pages/admin/Profile";
import Users from "./pages/admin/users";
import PlatformConfigLayout from "./components/layouts/PlatformConfigLayout";
import SBUsConfig from "./pages/admin/config/sbus";
import SBUDetails from "./pages/admin/config/sbus/[id]";
import SMTPConfig from "./pages/admin/config/smtp";
import LevelConfig from "./pages/admin/config/level";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="config" element={<PlatformConfigLayout />}>
              <Route index element={<AdminConfig />} />
              <Route path="sbus" element={<SBUsConfig />} />
              <Route path="sbus/:id" element={<SBUDetails />} />
              <Route path="smtp" element={<SMTPConfig />} />
              <Route path="level" element={<LevelConfig />} />
            </Route>
            <Route path="profile" element={<AdminProfile />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;