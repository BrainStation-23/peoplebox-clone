import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart } from "../../ReportsTab/charts/DonutChart";

type ResponseRateDonutChartProps = {
  title: string;
  data: Array<{
    name: string;
    value: number;
  }>;
  className?: string;
};

export function ResponseRateDonutChart({ title, data, className }: ResponseRateDonutChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <DonutChart 
            data={data} 
            colors={["#3b82f6", "#ef4444", "#22c55e", "#eab308"]} 
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{item.name}</span>
              <span className="font-medium">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}