import { SlideProps } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";

export function StatusDistributionSlide({ campaign, isActive }: SlideProps) {
  const data = [
    { name: "Completed", value: campaign.completion_rate },
    { name: "Pending", value: 100 - campaign.completion_rate },
  ];

  const COLORS = ["#0088FE", "#00C49F"];

  return (
    <div 
      className={cn(
        "absolute inset-0 transition-opacity duration-500 ease-in-out",
        "bg-gradient-to-br from-white to-gray-50",
        "rounded-lg shadow-lg p-8",
        isActive ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="h-full flex flex-col">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Response Distribution</h2>
        <div className="flex-1 flex items-center justify-center">
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
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}