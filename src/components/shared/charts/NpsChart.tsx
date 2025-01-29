import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface NpsChartProps {
  data: Array<{
    rating: number;
    count: number;
  }>;
}

export function NpsChart({ data }: NpsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="rating" />
        <YAxis />
        <Tooltip />
        <Bar
          dataKey="count"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}