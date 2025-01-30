import { Progress } from "@/components/ui/progress";

interface NpsChartProps {
  data: Array<{
    rating: number;
    count: number;
    group?: string;
  }>;
}

export function NpsChart({ data }: NpsChartProps) {
  // Group data by dimension if it exists
  const groupedData = data.reduce((acc, item) => {
    const group = item.group || 'Overall';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {} as Record<string, typeof data>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedData).map(([group, groupData]) => {
        const totalResponses = groupData.reduce((sum, item) => sum + item.count, 0);
        
        const segments = groupData.reduce((acc, item) => {
          if (item.rating <= 6) {
            acc.detractors += item.count;
          } else if (item.rating <= 8) {
            acc.passives += item.count;
          } else {
            acc.promoters += item.count;
          }
          return acc;
        }, { detractors: 0, passives: 0, promoters: 0 });

        const percentages = {
          detractors: (segments.detractors / totalResponses) * 100,
          passives: (segments.passives / totalResponses) * 100,
          promoters: (segments.promoters / totalResponses) * 100,
        };

        const npsScore = Math.round(percentages.promoters - percentages.detractors);

        return (
          <div key={group} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">{group}</div>
              <div className="text-2xl font-bold">NPS: {npsScore}</div>
            </div>

            {/* Segments */}
            <div className="space-y-4">
              {/* Promoters */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Promoters</span>
                  <span className="font-medium">
                    {Math.round(percentages.promoters)}% ({segments.promoters})
                  </span>
                </div>
                <Progress 
                  value={percentages.promoters} 
                  className="bg-gray-100 h-2"
                  indicatorClassName="bg-[#22c55e]"
                />
              </div>

              {/* Passives */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Passives</span>
                  <span className="font-medium">
                    {Math.round(percentages.passives)}% ({segments.passives})
                  </span>
                </div>
                <Progress 
                  value={percentages.passives} 
                  className="bg-gray-100 h-2"
                  indicatorClassName="bg-[#eab308]"
                />
              </div>

              {/* Detractors */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Detractors</span>
                  <span className="font-medium">
                    {Math.round(percentages.detractors)}% ({segments.detractors})
                  </span>
                </div>
                <Progress 
                  value={percentages.detractors} 
                  className="bg-gray-100 h-2"
                  indicatorClassName="bg-[#ef4444]"
                />
              </div>
            </div>

            {/* Total Responses */}
            <div className="text-center text-sm text-muted-foreground">
              Total Responses: {totalResponses}
            </div>
          </div>
        );
      })}
    </div>
  );
}