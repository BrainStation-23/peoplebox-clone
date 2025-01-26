import { SlideProps } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

export function StatusDistributionSlide({ campaign, isActive }: SlideProps) {
  const data = [
    { name: "Completed", value: campaign.completion_rate },
    { name: "Pending", value: 100 - campaign.completion_rate },
  ];

  const COLORS = ["#10B981", "#6B7280"];

  return (
    <div className={`slide ${isActive ? 'active' : ''} p-8 space-y-6`}>
      <h2 className="text-3xl font-bold mb-8">Response Distribution</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}