import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SBUStats = {
  sbu_name: string;
  total_assignments: number;
  completed_assignments: number;
  response_rate: number;
};

type Props = {
  campaignId: string;
  instanceId?: string;
};

export function SBUResponseRates({ campaignId, instanceId }: Props) {
  const { data: sbuStats, isLoading } = useQuery({
    queryKey: ["sbu-response-rates", campaignId, instanceId],
    queryFn: async () => {
      const { data: assignments, error } = await supabase
        .from("survey_assignments")
        .select(`
          id,
          user_id,
          user:profiles!survey_assignments_user_id_fkey (
            user_sbus!profiles_id_fkey (
              sbu:sbus!user_sbus_sbu_id_fkey (
                id,
                name
              ),
              is_primary
            )
          ),
          responses:survey_responses!survey_responses_assignment_id_fkey (
            id,
            campaign_instance_id
          )
        `)
        .eq("campaign_id", campaignId);

      if (error) throw error;

      // Process data to calculate response rates by SBU
      const sbuMap = new Map<string, SBUStats>();

      assignments?.forEach((assignment) => {
        // Get primary SBU for the user
        const primarySbu = assignment.user?.user_sbus?.find(
          (us) => us.is_primary && us.sbu
        );
        
        if (!primarySbu?.sbu) return;

        const sbuName = primarySbu.sbu.name;
        const current = sbuMap.get(sbuName) || {
          sbu_name: sbuName,
          total_assignments: 0,
          completed_assignments: 0,
          response_rate: 0,
        };

        current.total_assignments += 1;

        // Check if there's a response for this assignment matching the instance
        const hasResponse = assignment.responses?.some((response) =>
          instanceId ? response.campaign_instance_id === instanceId : true
        );

        if (hasResponse) {
          current.completed_assignments += 1;
        }

        sbuMap.set(sbuName, current);
      });

      // Calculate response rates and convert to array
      return Array.from(sbuMap.values()).map((sbu) => ({
        ...sbu,
        response_rate: Math.round(
          (sbu.completed_assignments / sbu.total_assignments) * 100
        ),
      }));
    },
  });

  if (isLoading) return <div>Loading...</div>;

  if (!sbuStats?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response Rates by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No department data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Rates by Department</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sbuStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sbu_name" />
                <YAxis unit="%" />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === "Response Rate") return `${value}%`;
                    return value;
                  }}
                />
                <Bar
                  dataKey="response_rate"
                  fill="#8884d8"
                  name="Response Rate"
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Total Assigned</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">Response Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sbuStats.map((sbu) => (
                  <TableRow key={sbu.sbu_name}>
                    <TableCell>{sbu.sbu_name}</TableCell>
                    <TableCell className="text-right">
                      {sbu.total_assignments}
                    </TableCell>
                    <TableCell className="text-right">
                      {sbu.completed_assignments}
                    </TableCell>
                    <TableCell className="text-right">{sbu.response_rate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}