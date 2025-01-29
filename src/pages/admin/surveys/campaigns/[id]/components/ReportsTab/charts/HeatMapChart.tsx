import { Card } from "@/components/ui/card";

interface HeatMapData {
  dimension: string;
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
}

interface HeatMapChartProps {
  data: HeatMapData[];
}

export function HeatMapChart({ data }: HeatMapChartProps) {
  const getColorIntensity = (percentage: number) => {
    // Convert percentage to a hex opacity value
    const opacity = Math.round((percentage / 100) * 255).toString(16).padStart(2, '0');
    return opacity;
  };

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[500px]">
        <thead>
          <tr>
            <th className="text-left p-2">Group</th>
            <th className="text-center p-2">Unsatisfied (1-3)</th>
            <th className="text-center p-2">Neutral (4)</th>
            <th className="text-center p-2">Satisfied (5)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.dimension}>
              <td className="p-2 font-medium">{row.dimension}</td>
              <td className="p-2">
                <div
                  className="w-full h-10 flex items-center justify-center"
                  style={{
                    backgroundColor: `#ef4444${getColorIntensity(
                      getPercentage(row.unsatisfied, row.total)
                    )}`,
                  }}
                >
                  {getPercentage(row.unsatisfied, row.total)}%
                </div>
              </td>
              <td className="p-2">
                <div
                  className="w-full h-10 flex items-center justify-center"
                  style={{
                    backgroundColor: `#eab308${getColorIntensity(
                      getPercentage(row.neutral, row.total)
                    )}`,
                  }}
                >
                  {getPercentage(row.neutral, row.total)}%
                </div>
              </td>
              <td className="p-2">
                <div
                  className="w-full h-10 flex items-center justify-center"
                  style={{
                    backgroundColor: `#22c55e${getColorIntensity(
                      getPercentage(row.satisfied, row.total)
                    )}`,
                  }}
                >
                  {getPercentage(row.satisfied, row.total)}%
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}