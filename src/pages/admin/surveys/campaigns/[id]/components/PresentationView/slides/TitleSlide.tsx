import { SlideProps } from "../types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function TitleSlide({ campaign, isActive }: SlideProps) {
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
        <h1 className="text-4xl font-bold text-gray-900">{campaign.name}</h1>
        {campaign.description && (
          <p className="text-xl text-gray-600">{campaign.description}</p>
        )}
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Campaign Period</h3>
            <p className="text-lg text-gray-900">
              {format(new Date(campaign.starts_at), "PPP")} -{" "}
              {format(new Date(campaign.ends_at), "PPP")}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Completion Rate</h3>
            <p className="text-3xl font-bold text-primary">
              {campaign.completion_rate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}