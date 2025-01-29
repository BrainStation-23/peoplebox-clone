import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface BooleanChartsProps {
  data: {
    yes: number;
    no: number;
  };
}

export function BooleanCharts({ data }: BooleanChartsProps) {
  const chartData = [
    { name: 'Yes', value: data.yes },
    { name: 'No', value: data.no },
  ];

  const COLORS = ['#22c55e', '#ef4444'];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}