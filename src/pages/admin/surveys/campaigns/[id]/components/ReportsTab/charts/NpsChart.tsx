import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface NpsChartProps {
  title: string;
  data: Array<{
    rating: number;
    count: number;
  }>;
}

export function NpsChart({ title, data }: NpsChartProps) {
  const chartData = Array.from({ length: 11 }, (_, i) => ({
    rating: i,
    count: data.find(d => d.rating === i)?.count || 0
  }));

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
            grid: { stroke: "var(--border)" },
            tooltip: { fill: "var(--background)" },
          }}
        >
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rating" />
            <YAxis allowDecimals={false} />
            <ChartTooltip>
              <ChartTooltipContent />
            </ChartTooltip>
            <Bar
              dataKey="count"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
              cellContent={(props: any) => {
                const { x, y, width, height, rating } = props;
                return (
                  <path
                    d={`M${x},${y + height}h${width}v${-height}h${-width}z`}
                    fill={getBarColor(rating)}
                  />
                );
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}