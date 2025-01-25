import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";

interface NpsChartProps {
  title: string;
  data: Array<{
    rating: number;
    count: number;
  }>;
}

export function NpsChart({ title, data }: NpsChartProps) {
  const getBarColor = (rating: number) => {
    if (rating <= 6) return "#ef4444"; // Red for detractors
    if (rating <= 8) return "#eab308"; // Yellow for passives
    return "#22c55e"; // Green for promoters
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer
          config={{
            grid: {
              theme: {
                light: "var(--border)",
                dark: "var(--border)",
              },
            },
          }}
        >
          <BarChart data={data}>
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
        </ChartContainer>
      </CardContent>
    </Card>
  );
}