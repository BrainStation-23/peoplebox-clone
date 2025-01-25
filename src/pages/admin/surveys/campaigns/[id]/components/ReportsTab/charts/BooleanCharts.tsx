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

          <TabsContent value="bar" className="h-[300px]">
            <ChartContainer
              config={{
                bar: {
                  color: "var(--primary)"
                },
                grid: {
                  color: "var(--border)"
                },
                tooltip: {
                  color: "var(--background)"
                },
              }}
            >
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="answer" />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={(props) => (
                  <ChartTooltipContent {...props} />
                )} />
                <Bar
                  dataKey="count"
                  fill="currentColor"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary"
                >
                  {barData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="pie" className="h-[300px]">
            <ChartContainer
              config={{
                pie: {
                  color: "var(--primary)"
                },
                tooltip: {
                  color: "var(--background)"
                },
              }}
            >
              <PieChart>
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
                <ChartTooltip content={(props) => (
                  <ChartTooltipContent {...props} />
                )} />
              </PieChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}