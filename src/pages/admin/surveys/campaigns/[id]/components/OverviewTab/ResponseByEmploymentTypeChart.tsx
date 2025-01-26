import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type EmploymentTypeStats = {
  employment_type: string;
  total_assignments: number;
  completed_assignments: number;
  response_rate: number;
};

type Props = {
  campaignId: string;
  instanceId?: string;
};

export function ResponseByEmploymentTypeChart({ campaignId, instanceId }: Props) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["employment-type-response-rates", campaignId, instanceId],
    queryFn: async () => {
      const query = supabase
        .from("survey_assignments")
        .select(`
          id,
          user:profiles!survey_assignments_user_id_fkey (
            employment_type:employment_types!profiles_employment_type_id_fkey (
              name
            )
          ),
          responses:survey_responses!survey_responses_assignment_id_fkey (
            id,
            campaign_instance_id
          )
        `)
        .eq("campaign_id", campaignId);

      if (instanceId) {
        query.eq("survey_responses.campaign_instance_id", instanceId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process data to calculate stats by employment type
      const employmentTypeMap = new Map<string, EmploymentTypeStats>();

      data?.forEach((assignment) => {
        const typeName = assignment.user?.employment_type?.name || "Not Specified";
        const current = employmentTypeMap.get(typeName) || {
          employment_type: typeName,
          total_assignments: 0,
          completed_assignments: 0,
          response_rate: 0,
        };

        current.total_assignments += 1;
        if (assignment.responses?.length > 0) {
          current.completed_assignments += 1;
        }

        employmentTypeMap.set(typeName, current);
      });

      // Calculate response rates and convert to array
      return Array.from(employmentTypeMap.values()).map((stats) => ({
        ...stats,
        response_rate: Math.round(
          (stats.completed_assignments / stats.total_assignments) * 100
        ),
      }));
    },
  });

  if (isLoading) return <div>Loading...</div>;

  if (!stats?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response Rates by Employment Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No employment type data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Rates by Employment Type</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="employment_type" />
                <YAxis unit="%" />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Response Rate"]}
                />
                <Bar dataKey="response_rate" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employment Type</TableHead>
                  <TableHead className="text-right">Total Assigned</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">Response Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat) => (
                  <TableRow key={stat.employment_type}>
                    <TableCell>{stat.employment_type}</TableCell>
                    <TableCell className="text-right">
                      {stat.total_assignments}
                    </TableCell>
                    <TableCell className="text-right">
                      {stat.completed_assignments}
                    </TableCell>
                    <TableCell className="text-right">{stat.response_rate}%</TableCell>
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