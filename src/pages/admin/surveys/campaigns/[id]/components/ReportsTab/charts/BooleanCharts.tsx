import { CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BooleanData {
  yes: number;
  no: number;
}

interface BooleanChartsProps {
  data: BooleanData;
}

export function BooleanCharts({ data }: BooleanChartsProps) {
  const barData = [
    { answer: "Yes", count: data.yes },
    { answer: "No", count: data.no },
  ];

  const COLORS = ["#22c55e", "#ef4444"];
  const chartConfig = {
    yes: { color: "#22c55e" },
    no: { color: "#ef4444" },
  };

  return (
    <Tabs defaultValue="chart" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="chart">Bar Chart</TabsTrigger>
        <TabsTrigger value="table">Table View</TabsTrigger>
      </TabsList>

      <TabsContent value="chart">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
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
          </ResponsiveContainer>
        </ChartContainer>
      </TabsContent>

      <TabsContent value="table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Answer</TableHead>
              <TableHead className="text-right">Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {barData.map((stat) => (
              <TableRow key={stat.answer}>
                <TableCell>{stat.answer}</TableCell>
                <TableCell className="text-right">{stat.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  );
}