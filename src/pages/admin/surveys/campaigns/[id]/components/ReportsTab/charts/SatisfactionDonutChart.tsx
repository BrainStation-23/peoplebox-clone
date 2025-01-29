import { Card } from "@/components/ui/card";
import { DonutChart } from "./DonutChart";

interface SatisfactionDonutChartProps {
  data: {
    unsatisfied: number;
    neutral: number;
    satisfied: number;
    total: number;
  };
}

export function SatisfactionDonutChart({ data }: SatisfactionDonutChartProps) {
  const chartData = [
    {
      name: "Satisfied",
      value: data.satisfied,
    },
    {
      name: "Neutral",
      value: data.neutral,
    },
    {
      name: "Unsatisfied",
      value: data.unsatisfied,
    },
  ];

  const colors = ["#22c55e", "#eab308", "#ef4444"];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-2xl font-semibold mb-1">Satisfaction Rating</div>
        <div className="text-4xl font-bold">
          {Math.round((data.satisfied / data.total) * 100)}%
        </div>
        <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
      </div>

      <DonutChart data={chartData} colors={colors} />

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-sm font-medium">Satisfied</div>
          <div className="text-2xl font-bold text-[#22c55e]">
            {Math.round((data.satisfied / data.total) * 100)}%
          </div>
          <div className="text-sm text-muted-foreground">({data.satisfied})</div>
        </div>
        <div>
          <div className="text-sm font-medium">Neutral</div>
          <div className="text-2xl font-bold text-[#eab308]">
            {Math.round((data.neutral / data.total) * 100)}%
          </div>
          <div className="text-sm text-muted-foreground">({data.neutral})</div>
        </div>
        <div>
          <div className="text-sm font-medium">Unsatisfied</div>
          <div className="text-2xl font-bold text-[#ef4444]">
            {Math.round((data.unsatisfied / data.total) * 100)}%
          </div>
          <div className="text-sm text-muted-foreground">({data.unsatisfied})</div>
        </div>
      </div>
    </div>
  );
}