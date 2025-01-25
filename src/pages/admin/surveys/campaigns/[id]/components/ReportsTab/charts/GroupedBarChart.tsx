import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

interface GroupedBarChartProps {
  data: Array<{
    name: string;
    [key: string]: number | string;
  }>;
  keys: string[];
  colors?: string[];
}

export function GroupedBarChart({ data, keys, colors = ["#3b82f6", "#22c55e", "#eab308"] }: GroupedBarChartProps) {
  return (
    <ChartContainer config={{}}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return <ChartTooltipContent active={active} payload={payload} label={label} />;
            }}
          />
          <Legend />
          {keys.map((key, index) => (
            <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}