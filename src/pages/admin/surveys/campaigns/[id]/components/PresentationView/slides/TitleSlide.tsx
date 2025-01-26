import { SlideProps } from "../types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function TitleSlide({ campaign, isActive }: SlideProps) {
  // Use instance dates and completion rate if available, otherwise use campaign data
  const startDate = campaign.instance?.starts_at || campaign.starts_at;
  const endDate = campaign.instance?.ends_at || campaign.ends_at;
  const completionRate = campaign.instance?.completion_rate ?? campaign.completion_rate;

  return (
    <div 
      className={cn(
        "absolute inset-0 transition-opacity duration-500 ease-in-out",
        "bg-gradient-to-br from-white to-gray-50",
        "rounded-lg shadow-lg p-8",
        isActive ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="h-full flex flex-col justify-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">{campaign.name}</h1>
          {campaign.instance && (
            <p className="text-xl text-primary">Period {campaign.instance.period_number}</p>
          )}
          {campaign.description && (
            <p className="text-xl text-gray-600">{campaign.description}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Period</h3>
            <p className="text-lg text-gray-900">
              {format(new Date(startDate), "PPP")} -{" "}
              {format(new Date(endDate), "PPP")}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Completion Rate</h3>
            <p className="text-3xl font-bold text-primary">
              {completionRate?.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}