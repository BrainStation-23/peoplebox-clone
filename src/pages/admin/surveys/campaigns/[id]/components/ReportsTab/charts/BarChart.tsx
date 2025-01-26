import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface BarChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  colors?: string[];
}

export function BarChart({ data, colors = ["#3b82f6"] }: BarChartProps) {
  return (
    <ChartContainer config={{}}>
      <ResponsiveContainer width="100%" height={180}>
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <ChartTooltip 
            cursor={false}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return <ChartTooltipContent active={active} payload={payload} />;
            }}
          />
          <Bar
            dataKey="value"
            fill={colors[0]}
            radius={[4, 4, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}