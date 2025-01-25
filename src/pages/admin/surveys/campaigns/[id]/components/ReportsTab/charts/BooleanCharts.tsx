import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";

interface BooleanChartsProps {
  title: string;
  data: {
    yes: number;
    no: number;
  };
}

export function BooleanCharts({ title, data }: BooleanChartsProps) {
  const barData = [
    { answer: "Yes", count: data.yes },
    { answer: "No", count: data.no },
  ];

  const pieData = [
    { name: "Yes", value: data.yes },
    { name: "No", value: data.no },
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bar">
          <TabsList className="mb-4">
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="bar" className="h-[300px] w-full">
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
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="answer" />
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
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="pie" className="h-[300px] w-full">
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
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return <ChartTooltipContent active={active} payload={payload} />;
                  }}
                />
              </PieChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}