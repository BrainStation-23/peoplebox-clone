import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminLayout from "./components/layouts/AdminLayout";
import UserLayout from "./components/layouts/UserLayout";
import Dashboard from "./pages/Dashboard";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminConfig from "./pages/admin/Config";
import AdminProfile from "./pages/admin/Profile";
import Users from "./pages/admin/users";
import EditUserPage from "./pages/admin/users/[id]/edit";
import PlatformConfigLayout from "./components/layouts/PlatformConfigLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* User routes */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Navigate to="/user/dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="my-surveys" element={<UserMySurveys />} />
            <Route path="my-surveys/:id" element={<UserSurveyResponse />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id/edit" element={<EditUserPage />} />
            <Route path="my-surveys" element={<MySurveysPage />} />
            <Route path="my-surveys/:id" element={<SurveyResponsePage />} />
            <Route path="surveys" element={<SurveysPage />} />
            <Route path="surveys/create" element={<SurveyFormPage />} />
            <Route path="surveys/:id/edit" element={<SurveyFormPage />} />
            <Route path="surveys/:id/preview" element={<PreviewSurveyPage />} />
            <Route path="surveys/campaigns" element={<CampaignsPage />} />
            <Route path="surveys/campaigns/create" element={<CampaignFormPage />} />
            <Route path="surveys/campaigns/:id" element={<CampaignDetailsPage />} />
            <Route path="surveys/campaigns/:id/edit" element={<CampaignDetailsPage />} />
            <Route path="config" element={<PlatformConfigLayout />}>
              <Route index element={<AdminConfig />} />
              <Route path="sbus" element={<SBUsConfig />} />
              <Route path="sbus/:id" element={<SBUDetails />} />
              <Route path="email" element={<EmailConfig />} />
              <Route path="level" element={<LevelConfig />} />
              <Route path="location" element={<LocationConfig />} />
              <Route path="employment-type" element={<EmploymentTypeConfig />} />
            </Route>
            <Route path="profile" element={<AdminProfile />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
