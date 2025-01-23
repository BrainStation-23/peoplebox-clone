import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminLayout from "@/components/layouts/AdminLayout";
import Admin from "@/pages/Admin";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProfile from "@/pages/admin/Profile";
import AdminUsers from "@/pages/admin/Users";
import AdminSurveys from "@/pages/admin/Surveys";
import AdminConfig from "@/pages/admin/Config";
import AdminMySurveys from "@/pages/admin/MySurveys";
import AdminSurveyCampaigns from "@/pages/admin/surveys/Campaigns";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<Admin />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="surveys" element={<AdminSurveys />} />
              <Route path="my-surveys" element={<AdminMySurveys />} />
              <Route path="config" element={<AdminConfig />} />
              <Route path="surveys/campaigns" element={<AdminSurveyCampaigns />} />
            </Route>
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;