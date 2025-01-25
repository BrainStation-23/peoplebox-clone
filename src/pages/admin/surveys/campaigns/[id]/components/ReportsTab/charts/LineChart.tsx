import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface LineChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  color?: string;
}

export function LineChart({ data, color = "#3b82f6" }: LineChartProps) {
  return (
    <ChartContainer config={{}}>
      <ResponsiveContainer width="100%" height={180}>
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return <ChartTooltipContent active={active} payload={payload} />;
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            dot={{ fill: color }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}