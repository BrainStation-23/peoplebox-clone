import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export function OverviewTab({ campaignId }: { campaignId: string }) {
  // Fetch campaign details including completion rate
  const { data: campaign } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch responses over time
  const { data: responseData } = useQuery({
    queryKey: ["campaign-responses", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_responses")
        .select(`
          created_at,
          assignment:survey_assignments!inner(
            campaign_id
          )
        `)
        .eq("assignment.campaign_id", campaignId)
        .order("created_at");
      
      if (error) throw error;

      // Group responses by date
      const groupedData = data.reduce((acc: any[], response) => {
        const date = format(new Date(response.created_at), "MMM d");
        const existingEntry = acc.find(entry => entry.date === date);
        
        if (existingEntry) {
          existingEntry.count += 1;
        } else {
          acc.push({ date, count: 1 });
        }
        
        return acc;
      }, []);

      return groupedData;
    },
  });

  // Fetch assignment status distribution
  const { data: statusData } = useQuery({
    queryKey: ["campaign-status-distribution", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_assignments")
        .select("status")
        .eq("campaign_id", campaignId);
      
      if (error) throw error;

      const distribution = data.reduce((acc: any, assignment) => {
        const status = assignment.status || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(distribution).map(([name, value]) => ({
        name,
        value,
      }));
    },
  });

  // Fetch recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ["campaign-recent-activity", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_responses")
        .select(`
          created_at,
          user:profiles!survey_responses_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .eq("assignment.campaign_id", campaignId)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Completion Rate Card */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign?.completion_rate?.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Response Rate Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={responseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#8884d8" 
                name="Responses"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData?.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {recentActivity?.map((activity) => (
                <div 
                  key={activity.created_at}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                    <p className="font-medium">
                      {activity.user.first_name} {activity.user.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.user.email}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(activity.created_at), "MMM d, yyyy HH:mm")}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}