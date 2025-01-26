import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TabPanel({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsContent value={value} className="space-y-4">
      {children}
    </TabsContent>
  );
}

interface CampaignTabsProps {
  children: React.ReactNode;
  isAnonymous?: boolean;
}

export function CampaignTabs({ children, isAnonymous }: CampaignTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="assignments">Assignments</TabsTrigger>
        {!isAnonymous && <TabsTrigger value="responses">Responses</TabsTrigger>}
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}