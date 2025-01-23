import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
      const query = supabase
        .from("survey_sbu_assignments")
        .select(`
          sbu:sbus(id, name),
          assignment:survey_assignments!inner(
            id,
            responses:survey_responses(id)
          )
        `)
        .eq("assignment.campaign_id", campaignId);

      if (instanceId) {
        query.eq("assignment.responses.campaign_instance_id", instanceId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Process data to calculate response rates by SBU
      const sbuMap = new Map<string, SBUStats>();
      
      data.forEach((record) => {
        const sbuName = record.sbu?.name || "Unknown";
        const current = sbuMap.get(sbuName) || {
          sbu_name: sbuName,
          total_assignments: 0,
          completed_assignments: 0,
          response_rate: 0,
        };

        current.total_assignments += 1;
        if (record.assignment?.responses?.length > 0) {
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
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sbuStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sbu_name" />
            <YAxis unit="%" />
            <Tooltip />
            <Bar dataKey="response_rate" fill="#8884d8" name="Response Rate" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}