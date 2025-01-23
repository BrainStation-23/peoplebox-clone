import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface NPSVisualizerProps {
  promoters: number;
  passives: number;
  detractors: number;
  npsScore: number;
  title: string;
}

export function NPSVisualizer({ promoters, passives, detractors, npsScore, title }: NPSVisualizerProps) {
  const data = [
    { name: 'Detractors (0-6)', value: detractors, fill: '#ff4d4f' },
    { name: 'Passives (7-8)', value: passives, fill: '#faad14' },
    { name: 'Promoters (9-10)', value: promoters, fill: '#52c41a' },
  ];

  return (
    <div className="w-full h-[400px] p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-2xl font-bold">
          NPS Score: {npsScore}
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}