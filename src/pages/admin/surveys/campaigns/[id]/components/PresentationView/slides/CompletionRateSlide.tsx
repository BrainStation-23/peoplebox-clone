import { SlideProps } from "../types";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function CompletionRateSlide({ campaign, isActive }: SlideProps) {
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
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Campaign Completion</h2>
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-primary mb-2">
              {campaign.completion_rate?.toFixed(1)}%
            </div>
            <div className="text-lg text-gray-600">Overall Completion Rate</div>
          </div>
          
          <div className="w-full max-w-lg space-y-2">
            <Progress 
              value={campaign.completion_rate || 0} 
              className="h-4"
              indicatorClassName={cn(
                campaign.completion_rate >= 75 ? "bg-green-500" :
                campaign.completion_rate >= 50 ? "bg-yellow-500" :
                "bg-red-500"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}