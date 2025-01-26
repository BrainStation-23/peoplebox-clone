import { SlideProps, QuestionResponseData } from "../types";
import { cn } from "@/lib/utils";
import { BooleanCharts } from "../../ReportsTab/charts/BooleanCharts";
import { NpsChart } from "../../ReportsTab/charts/NpsChart";
import { WordCloud } from "../../ReportsTab/charts/WordCloud";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface QuestionSlideProps extends SlideProps {
  questionName: string;
  questionTitle: string;
  questionType: string;
}

export function QuestionSlide({ campaign, isActive, questionName, questionTitle, questionType }: QuestionSlideProps) {
  const { data: responses } = useQuery({
    queryKey: ["question-responses", campaign.id, campaign.instance?.id, questionName],
    queryFn: async () => {
      const query = supabase
        .from("survey_responses")
        .select(`
          response_data,
          assignment:survey_assignments!inner(
            campaign_id
          )
        `)
        .eq("assignment.campaign_id", campaign.id);

      if (campaign.instance) {
        query.eq("campaign_instance_id", campaign.instance.id);
      }

      const { data } = await query;
      return data || [];
    },
  });

  const processAnswers = (): QuestionResponseData | null => {
    if (!responses) return null;

    switch (questionType) {
      case "boolean": {
        const answers = responses.map((r) => r.response_data[questionName]?.answer);
        return {
          type: 'boolean',
          data: {
            yes: answers.filter((a) => a === true).length,
            no: answers.filter((a) => a === false).length,
          }
        };
      }

      case "nps":
      case "rating": {
        const answers = responses.map((r) => r.response_data[questionName]?.answer);
        const ratingCounts = new Array(11).fill(0);
        answers.forEach((rating) => {
          if (typeof rating === "number" && rating >= 0 && rating <= 10) {
            ratingCounts[rating]++;
          }
        });
        return {
          type: 'rating',
          data: ratingCounts.map((count, rating) => ({ rating, count }))
        };
      }

      case "text":
      case "comment": {
        const wordFrequency: Record<string, number> = {};
        responses.forEach((response) => {
          const answer = response.response_data[questionName]?.answer;
          if (typeof answer === "string") {
            const words = answer
              .toLowerCase()
              .replace(/[^\w\s]/g, "")
              .split(/\s+/)
              .filter((word) => word.length > 2);

            words.forEach((word) => {
              wordFrequency[word] = (wordFrequency[word] || 0) + 1;
            });
          }
        });

        return {
          type: 'text',
          data: Object.entries(wordFrequency)
            .map(([text, value]) => ({ text, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 50)
        };
      }

      default:
        return null;
    }
  };

  const processedData = processAnswers();

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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {questionTitle}
            {campaign.instance && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                (Period {campaign.instance.period_number})
              </span>
            )}
          </h2>
        </div>

        <div className="flex-1 flex items-center justify-center">
          {processedData && (
            <div className="w-full max-w-3xl">
              {processedData.type === "boolean" && (
                <BooleanCharts data={processedData.data} />
              )}
              {processedData.type === "rating" && (
                <NpsChart data={processedData.data} />
              )}
              {processedData.type === "text" && (
                <WordCloud words={processedData.data} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}