import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList, ResponsiveContainer } from "recharts";

interface SatisfactionDonutChartProps {
  data: {
    unsatisfied: number;
    neutral: number;
    satisfied: number;
    total: number;
    median: number;
  };
}

export function SatisfactionDonutChart({ data }: SatisfactionDonutChartProps) {
  const chartData = [
    {
      name: "Satisfaction",
      Unsatisfied: data.unsatisfied,
      Neutral: data.neutral,
      Satisfied: data.satisfied,
    },
  ];

  const getPercentage = (value: number) => {
    return Math.round((value / data.total) * 100);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { dataKey, value } = payload[0];
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{dataKey}</p>
          <p className="text-sm">
            {value} responses ({getPercentage(value)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    const percentage = getPercentage(value);
    if (percentage < 10) return null;

    return (
      <text
        x={x + width / 2}
        y={y + 15}
        textAnchor="middle"
        fill="#fff"
        className="text-xs font-medium"
      >
        {percentage}%
      </text>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Response Distribution</h3>
          <p className="text-sm text-muted-foreground">
            Based on {data.total} responses
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {getPercentage(data.satisfied)}%
            </div>
            <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {data.median.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Median Score</div>
          </div>
        </div>
      </div>

      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            stackOffset="expand"
            barSize={40}
          >
            <XAxis
              type="number"
              tickFormatter={(value) => `${Math.round(value * 100)}%`}
            />
            <YAxis type="category" hide />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom"
              height={36}
              formatter={(value) => `${value} (${getPercentage(data[value.toLowerCase()])}%)`}
            />
            <Bar
              dataKey="Unsatisfied"
              fill="#ef4444"
              stackId="stack"
            >
              <LabelList
                content={<CustomLabel />}
                position="center"
              />
            </Bar>
            <Bar
              dataKey="Neutral"
              fill="#eab308"
              stackId="stack"
            >
              <LabelList
                content={<CustomLabel />}
                position="center"
              />
            </Bar>
            <Bar
              dataKey="Satisfied"
              fill="#22c55e"
              stackId="stack"
            >
              <LabelList
                content={<CustomLabel />}
                position="center"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="font-medium text-red-600">Unsatisfied</div>
          <div className="text-lg font-semibold">
            {data.unsatisfied}
          </div>
          <div className="text-muted-foreground">
            responses
          </div>
        </div>
        <div>
          <div className="font-medium text-yellow-600">Neutral</div>
          <div className="text-lg font-semibold">
            {data.neutral}
          </div>
          <div className="text-muted-foreground">
            responses
          </div>
        </div>
        <div>
          <div className="font-medium text-green-600">Satisfied</div>
          <div className="text-lg font-semibold">
            {data.satisfied}
          </div>
          <div className="text-muted-foreground">
            responses
          </div>
        </div>
      </div>
    </div>
  );
}