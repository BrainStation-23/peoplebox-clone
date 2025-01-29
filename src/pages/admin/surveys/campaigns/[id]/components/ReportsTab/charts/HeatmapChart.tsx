import { ResponsiveContainer, XAxis, YAxis, Tooltip, Rectangle, ScatterChart } from 'recharts';

interface HeatmapProps {
  data: Array<{
    name: string;
    value: number;
    count: number;
  }>;
  xCategories: string[] | number[];
  height?: number;
}

export function HeatmapChart({ data, xCategories, height = 300 }: HeatmapProps) {
  const maxCount = Math.max(...data.map(d => d.count));
  
  // Calculate cell dimensions
  const yCategories = Array.from(new Set(data.map(d => d.name)));
  const cellHeight = 40;
  const calculatedHeight = Math.max(height, yCategories.length * cellHeight);

  return (
    <ResponsiveContainer width="100%" height={calculatedHeight}>
      <ScatterChart
        margin={{ top: 20, right: 20, bottom: 20, left: 100 }}
      >
        <XAxis
          type="category"
          dataKey="value"
          interval={0}
          tickLine={false}
          ticks={xCategories}
        />
        <YAxis
          type="category"
          dataKey="name"
          interval={0}
          tickLine={false}
          width={90}
        />
        <Tooltip
          content={({ payload }) => {
            if (!payload?.[0]) return null;
            const data = payload[0].payload;
            return (
              <div className="bg-white p-2 border rounded shadow">
                <p className="font-medium">{data.name}</p>
                <p>Value: {data.value}</p>
                <p>Count: {data.count}</p>
              </div>
            );
          }}
        />
        {data.map((cell, index) => (
          <Rectangle
            key={`cell-${index}`}
            x={(cell.value) * 40}
            y={yCategories.indexOf(cell.name) * cellHeight}
            width={40}
            height={cellHeight}
            fill="#8884d8"
            opacity={cell.count / maxCount}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}