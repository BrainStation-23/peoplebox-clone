import { SlideProps } from "../types";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function ResponseTrendsSlide({ campaign, isActive }: SlideProps) {
  const { data: trendsData } = useQuery({
    queryKey: ["response-trends", campaign.id],
    queryFn: async () => {
      const { data: responses } = await supabase
        .from("survey_responses")
        .select(`
          created_at,
          assignment:survey_assignments!inner(
            campaign_id
          )
        `)
        .eq("assignment.campaign_id", campaign.id)
        .order("created_at");

      if (!responses) return [];

      const responsesByDate = responses.reduce((acc: Record<string, number>, response) => {
        const date = format(parseISO(response.created_at), "MMM d");
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(responsesByDate).map(([date, count]) => ({
        date,
        responses: count
      }));
    }
  });

  return (
    <div 
      className={cn(
        "absolute inset-0 transition-opacity duration-500 ease-in-out",
        "bg-gradient-to-br from-white to-gray-50",
        "rounded-lg shadow-lg p-8",
        isActive ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="h-full flex flex-col">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Response Trends</h2>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="responses" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}