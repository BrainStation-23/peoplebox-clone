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
  title?: string;
}

export function HeatMapChart({ data = [], title }: HeatMapChartProps) {
  // Return early if no data is provided
  if (!data || data.length === 0) {
    return (
      <div className="w-full p-4 text-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const getColorIntensity = (percentage: number) => {
    // Minimum opacity of 0.1 (10%)
    const minOpacity = 0.1;
    // Scale the remaining 90% based on the percentage
    const opacity = minOpacity + ((1 - minOpacity) * (percentage / 100));
    // Convert to hex
    const hexOpacity = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return hexOpacity;
};


  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <div className="overflow-x-auto">
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
                    className="w-full h-10 flex items-center justify-center text-sm"
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
                    className="w-full h-10 flex items-center justify-center text-sm"
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
                    className="w-full h-10 flex items-center justify-center text-sm"
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
    </div>
  );
}
