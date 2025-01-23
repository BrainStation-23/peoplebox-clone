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
      // First, get all SBUs that have assignments for this campaign
      const { data: sbuAssignments, error: sbuError } = await supabase
        .from("survey_sbu_assignments")
        .select(`
          sbu:sbus(id, name),
          assignment:survey_assignments!inner(
            id,
            status,
            responses:survey_responses(
              id,
              campaign_instance_id
            )
          )
        `)
        .eq("assignment.campaign_id", campaignId);

      if (sbuError) throw sbuError;

      // Process data to calculate response rates by SBU
      const sbuMap = new Map<string, SBUStats>();
      
      sbuAssignments?.forEach((record) => {
        const sbuName = record.sbu?.name || "Unknown";
        const current = sbuMap.get(sbuName) || {
          sbu_name: sbuName,
          total_assignments: 0,
          completed_assignments: 0,
          response_rate: 0,
        };

        current.total_assignments += 1;

        // Check if there's a response for this assignment
        const hasResponse = record.assignment?.responses?.some(response => 
          // If instanceId is provided, check for specific instance
          instanceId 
            ? response.campaign_instance_id === instanceId
            : true
        );

        if (hasResponse) {
          current.completed_assignments += 1;
        }

        sbuMap.set(sbuName, current);
      });

      // Calculate response rates and convert to array
      return Array.from(sbuMap.values()).map(sbu => ({
        ...sbu,
        response_rate: Math.round((sbu.completed_assignments / sbu.total_assignments) * 100),
      }));
    },
  });

  if (isLoading) return <div>Loading...</div>;

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
                {sbuStats?.map((sbu) => (
                  <TableRow key={sbu.sbu_name}>
                    <TableCell>{sbu.sbu_name}</TableCell>
                    <TableCell className="text-right">{sbu.total_assignments}</TableCell>
                    <TableCell className="text-right">{sbu.completed_assignments}</TableCell>
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