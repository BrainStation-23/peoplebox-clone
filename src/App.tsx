import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminLayout from "@/components/layouts/AdminLayout";
import Admin from "@/pages/Admin";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProfile from "@/pages/admin/Profile";
import AdminConfig from "@/pages/admin/Config";
import AdminSurveys from "@/pages/admin/surveys";
import AdminMySurveys from "@/pages/admin/my-surveys";
import AdminUsers from "@/pages/admin/users";
import SurveyFormPage from "@/pages/admin/surveys/SurveyFormPage";
import PreviewSurveyPage from "@/pages/admin/surveys/[id]/preview";
import CampaignsPage from "@/pages/admin/surveys/campaigns";
import CampaignFormPage from "@/pages/admin/surveys/campaigns/CampaignFormPage";
import CampaignDetailsPage from "@/pages/admin/surveys/campaigns/[id]";
import PlatformConfigLayout from "@/components/layouts/PlatformConfigLayout";
import SBUsConfig from "@/pages/admin/config/sbus";
import SBUDetails from "@/pages/admin/config/sbus/[id]";
import EmailConfig from "@/pages/admin/config/email";
import LevelConfig from "@/pages/admin/config/level";
import SurveyResponsePage from "@/pages/admin/my-surveys/[id]";
import MySurveysList from "@/components/shared/surveys/MySurveysList";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard/*" element={<Dashboard />}>
              <Route index element={<AdminDashboard />} />
              <Route path="my-surveys" element={<MySurveysList />} />
              <Route path="my-surveys/:id" element={<SurveyResponsePage />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="surveys" element={<AdminSurveys />} />
              <Route path="surveys/create" element={<SurveyFormPage />} />
              <Route path="surveys/:id/edit" element={<SurveyFormPage />} />
              <Route path="surveys/:id/preview" element={<PreviewSurveyPage />} />
              <Route path="surveys/campaigns" element={<CampaignsPage />} />
              <Route path="surveys/campaigns/create" element={<CampaignFormPage />} />
              <Route path="surveys/campaigns/:id" element={<CampaignDetailsPage />} />
              <Route path="surveys/campaigns/:id/edit" element={<CampaignFormPage />} />
              <Route path="my-surveys" element={<AdminMySurveys />} />
              <Route path="my-surveys/:id" element={<SurveyResponsePage />} />
              <Route path="config" element={<PlatformConfigLayout />}>
                <Route index element={<AdminConfig />} />
                <Route path="sbus" element={<SBUsConfig />} />
                <Route path="sbus/:id" element={<SBUDetails />} />
                <Route path="email" element={<EmailConfig />} />
                <Route path="level" element={<LevelConfig />} />
              </Route>
            </Route>
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;