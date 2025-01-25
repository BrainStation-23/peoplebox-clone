import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer } from "recharts";

interface NpsChartProps {
  data: Array<{
    rating: number;
    count: number;
  }>;
}

export function NpsChart({ data }: NpsChartProps) {
  const getBarColor = (rating: number) => {
    if (rating <= 6) return "#ef4444"; // Red for detractors
    if (rating <= 8) return "#eab308"; // Yellow for passives
    return "#22c55e"; // Green for promoters
  };

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="rating" />
          <YAxis allowDecimals={false} />
          <ChartTooltip 
            cursor={false}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return <ChartTooltipContent active={active} payload={payload} />;
            }}
          />
          <Bar
            dataKey="count"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
            className="fill-primary"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.rating)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}