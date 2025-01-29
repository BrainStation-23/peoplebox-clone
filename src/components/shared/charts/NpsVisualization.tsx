import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface NpsVisualizationProps {
  data: Array<{
    rating: number;
    count: number;
  }>;
}

const COLORS = {
  detractor: "#ef4444", // red
  passive: "#eab308",   // yellow
  promoter: "#22c55e"   // green
};

export function NpsVisualization({ data }: NpsVisualizationProps) {
  // Calculate NPS categories
  const categories = data.reduce((acc, { rating, count }) => {
    if (rating <= 6) acc.detractors += count;
    else if (rating <= 8) acc.passives += count;
    else acc.promoters += count;
    return acc;
  }, { detractors: 0, passives: 0, promoters: 0 });

  // Calculate total responses and NPS score
  const totalResponses = Object.values(categories).reduce((a, b) => a + b, 0);
  const npsScore = totalResponses ? Math.round(
    ((categories.promoters - categories.detractors) / totalResponses) * 100
  ) : 0;

  // Prepare data for donut chart
  const donutData = [
    { name: 'Detractors (0-6)', value: categories.detractors, color: COLORS.detractor },
    { name: 'Passives (7-8)', value: categories.passives, color: COLORS.passive },
    { name: 'Promoters (9-10)', value: categories.promoters, color: COLORS.promoter }
  ];

  // Color function for bar chart
  const getBarColor = (rating: number) => {
    if (rating <= 6) return COLORS.detractor;
    if (rating <= 8) return COLORS.passive;
    return COLORS.promoter;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Distribution Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>Rating:</div>
                          <div className="font-medium">{data.rating}</div>
                          <div>Responses:</div>
                          <div className="font-medium">{data.count}</div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.rating)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown and NPS Score */}
      <Card>
        <CardHeader>
          <CardTitle>NPS Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            {/* NPS Score Display */}
            <div className="text-center">
              <div className="text-2xl font-bold">{npsScore}</div>
              <div className="text-sm text-muted-foreground">NPS Score</div>
            </div>

            {/* Donut Chart */}
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      const percentage = Math.round((data.value / totalResponses) * 100);
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div>{data.name}:</div>
                            <div className="font-medium">{data.value}</div>
                            <div>Percentage:</div>
                            <div className="font-medium">{percentage}%</div>
                          </div>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Legend */}
            <div className="flex gap-4 text-sm">
              {donutData.map((category) => (
                <div key={category.name} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-sm" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}