import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type ResponseData = {
  date: string;
  count: number;
};

type ResponseRateChartProps = {
  data: ResponseData[];
};

export function ResponseRateChart({ data }: ResponseRateChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Rate Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#8884d8" 
              name="Responses"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}