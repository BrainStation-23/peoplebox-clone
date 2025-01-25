import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "./OverviewTab";
import { AssignmentInstanceList } from "./AssignmentInstanceList";
import { ResponsesTab } from "./ResponsesTab";
import { ActivityTab } from "./ActivityTab";
import { ReportsTab } from "./ReportsTab";

export function TabPanel({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsContent value={value} className="space-y-4">
      {children}
    </TabsContent>
  );
}

export function CampaignTabs() {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="assignments">Assignments</TabsTrigger>
        <TabsTrigger value="responses">Responses</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      <TabPanel value="overview">
        <OverviewTab />
      </TabPanel>
      <TabPanel value="assignments">
        <AssignmentInstanceList />
      </TabPanel>
      <TabPanel value="responses">
        <ResponsesTab />
      </TabPanel>
      <TabPanel value="activity">
        <ActivityTab />
      </TabPanel>
      <TabPanel value="reports">
        <ReportsTab />
      </TabPanel>
    </Tabs>
  );
}