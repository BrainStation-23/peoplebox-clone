import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "assignments", label: "Assignments" },
  { id: "responses", label: "Responses" },
  { id: "activity", label: "Activity" },
  { id: "reports", label: "Reports" },
];

export function CampaignTabs({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.hash.replace("#", "") || "overview";

  const handleTabChange = (value: string) => {
    navigate({ hash: value });
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

export function TabPanel({ value, children }: { value: string; children: React.ReactNode }) {
  return <TabsContent value={value}>{children}</TabsContent>;
}