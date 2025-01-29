import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";

interface DonutChartProps {
  data: {
    yes?: number;
    no?: number;
  } | Array<{
    name: string;
    value: number;
  }>;
  colors?: string[];
}

export function DonutChart({ data, colors = ["#3b82f6", "#22c55e", "#eab308", "#ef4444"] }: DonutChartProps) {
  // Transform the data if it's in yes/no format
  const chartData = Array.isArray(data) 
    ? data 
    : [
        { name: 'Yes', value: data.yes || 0 },
        { name: 'No', value: data.no || 0 }
      ];

  if (!chartData.length) {
    return <div>No data available</div>;
  }

  return (
    <ChartContainer config={{}}>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return <ChartTooltipContent active={active} payload={payload} />;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}