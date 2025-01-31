import { SlideProps } from "../types";
import { cn } from "@/lib/utils";
import { BooleanCharts } from "../../ReportsTab/charts/BooleanCharts";
import { NpsChart } from "../../ReportsTab/charts/NpsChart";
import { WordCloud } from "../../ReportsTab/charts/WordCloud";
import { SatisfactionDonutChart } from "../../ReportsTab/charts/SatisfactionDonutChart";
import { HeatMapChart } from "../../ReportsTab/charts/HeatMapChart";
import { usePresentationResponses } from "../hooks/usePresentationResponses";
import { ComparisonDimension } from "../../ReportsTab/types/comparison";
import { BooleanResponseData, RatingResponseData, TextResponseData } from "../types/responses";

interface QuestionSlideProps extends SlideProps {
  questionName: string;
  questionTitle: string;
  questionType: string;
  slideType: 'main' | ComparisonDimension;
}

interface SatisfactionData {
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
}

interface NpsComparisonData {
  dimension: string;
  detractors: number;
  passives: number;
  promoters: number;
  total: number;
}

interface HeatMapData {
  dimension: string;
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
}

export function QuestionSlide({ 
  campaign, 
  isActive, 
  questionName, 
  questionTitle, 
  questionType,
  slideType = 'main'
}: QuestionSlideProps) {
  const { data } = usePresentationResponses(campaign.id, campaign.instance?.id);

  const getDimensionTitle = (dim: string) => {
    const titles: Record<string, string> = {
      sbu: "Response Distribution by Department",
      gender: "Response Distribution by Gender",
      location: "Response Distribution by Location",
      employment_type: "Response Distribution by Employment Type"
    };
    return titles[dim] || "";
  };
  
  const processAnswers = () => {
    if (!data?.responses) return null;

    const responses = data.responses;
    const question = data.questions.find(q => q.name === questionName);
    const isNps = question?.rateCount === 10;

    if (slideType === 'main') {
      switch (questionType) {
        case "boolean": {
          const answers = responses
            .filter(r => r.answers[questionName]?.answer !== undefined)
            .map(r => r.answers[questionName].answer);
          
          const result: BooleanResponseData = {
            yes: answers.filter((a) => a === true).length,
            no: answers.filter((a) => a === false).length,
          };
          return result;
        }

        case "rating": {
          const answers = responses
            .filter(r => typeof r.answers[questionName]?.answer === 'number')
            .map(r => r.answers[questionName].answer);
          
          if (isNps) {
            const ratingCounts: RatingResponseData = new Array(11).fill(0).map((_, rating) => ({
              rating,
              count: answers.filter(a => a === rating).length
            }));
            return ratingCounts;
          } else {
            const validAnswers = answers.filter(
              (rating) => typeof rating === "number" && rating >= 1 && rating <= 5
            );
            
            const result: SatisfactionData = {
              unsatisfied: validAnswers.filter((r) => r <= 2).length,
              neutral: validAnswers.filter((r) => r === 3).length,
              satisfied: validAnswers.filter((r) => r >= 4).length,
              total: validAnswers.length,
            };
            return result;
          }
        }

        case "text":
        case "comment": {
          const wordFrequency: Record<string, number> = {};
          responses.forEach((response) => {
            const answer = response.answers[questionName]?.answer;
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

          const result: TextResponseData = Object.entries(wordFrequency)
            .map(([text, value]) => ({ text, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 50);
          return result;
        }

        default:
          return null;
      }
    } else {
      if (isNps) {
        const dimensionData = new Map<string, NpsComparisonData>();

        responses.forEach((response) => {
          const answer = response.answers[questionName]?.answer;
          if (typeof answer !== 'number') return;

          let dimensionValue = "Unknown";
          switch (slideType) {
            case "sbu":
              dimensionValue = response.respondent.sbu?.name || "Unknown";
              break;
            case "gender":
              dimensionValue = response.respondent.gender || "Unknown";
              break;
            case "location":
              dimensionValue = response.respondent.location?.name || "Unknown";
              break;
            case "employment_type":
              dimensionValue = response.respondent.employment_type?.name || "Unknown";
              break;
          }

          if (!dimensionData.has(dimensionValue)) {
            dimensionData.set(dimensionValue, {
              dimension: dimensionValue,
              detractors: 0,
              passives: 0,
              promoters: 0,
              total: 0
            });
          }

          const group = dimensionData.get(dimensionValue)!;
          group.total += 1;

          if (answer <= 6) {
            group.detractors += 1;
          } else if (answer <= 8) {
            group.passives += 1;
          } else {
            group.promoters += 1;
          }
        });

        return Array.from(dimensionData.values());
      } else {
        const dimensionData = new Map<string, SatisfactionData>();

        responses.forEach((response) => {
          const answer = response.answers[questionName]?.answer;
          if (typeof answer !== 'number') return;

          let dimensionValue = "Unknown";
          switch (slideType) {
            case "sbu":
              dimensionValue = response.respondent.sbu?.name || "Unknown";
              break;
            case "gender":
              dimensionValue = response.respondent.gender || "Unknown";
              break;
            case "location":
              dimensionValue = response.respondent.location?.name || "Unknown";
              break;
            case "employment_type":
              dimensionValue = response.respondent.employment_type?.name || "Unknown";
              break;
          }

          if (!dimensionData.has(dimensionValue)) {
            dimensionData.set(dimensionValue, {
              unsatisfied: 0,
              neutral: 0,
              satisfied: 0,
              total: 0
            });
          }

          const group = dimensionData.get(dimensionValue)!;
          group.total += 1;

          if (answer <= 2) {
            group.unsatisfied += 1;
          } else if (answer === 3) {
            group.neutral += 1;
          } else {
            group.satisfied += 1;
          }
        });

        return Array.from(dimensionData.values());
      }
    }
  };

  const processedData = processAnswers();
  const question = data?.questions.find(q => q.name === questionName);
  const isNps = question?.type === 'rating' && question?.rateCount === 10;

  const isSatisfactionData = (data: any): data is SatisfactionData => {
    return data && 'unsatisfied' in data && 'neutral' in data && 'satisfied' in data && 'total' in data;
  };

  const isSatisfactionDataArray = (data: any): data is HeatMapData[] => {
    return Array.isArray(data) && data.length > 0 && 'dimension' in data[0] && 'unsatisfied' in data[0];
  };

  const isNpsComparisonData = (data: any): data is NpsComparisonData[] => {
    return Array.isArray(data) && data.length > 0 && 'dimension' in data[0] && 'detractors' in data[0];
  };

  return (
    <div 
      className={cn(
        "absolute inset-0 transition-opacity duration-500 ease-in-out",
        "bg-gradient-to-br from-white to-gray-50",
        "rounded-lg shadow-lg p-4 md:p-6 lg:p-8",
        isActive ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="h-full flex flex-col">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {questionTitle}
            {campaign.instance && (
              <span className="text-base md:text-lg font-normal text-gray-600 ml-2">
                (Period {campaign.instance.period_number})
              </span>
            )}
          </h2>
          {slideType !== 'main' && (
            <p className="text-base md:text-lg text-muted-foreground mt-2">
              {getDimensionTitle(slideType)}
            </p>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center overflow-auto">
          {slideType === 'main' ? (
            <div className="w-full max-w-4xl">
              {questionType === "boolean" && processedData && (
                <BooleanCharts data={processedData as BooleanResponseData} />
              )}
              {questionType === "rating" && processedData && (
                isNps ? (
                  <NpsChart data={processedData as RatingResponseData} />
                ) : (
                  isSatisfactionData(processedData) && (
                    <SatisfactionDonutChart data={processedData} />
                  )
                )
              )}
              {(questionType === "text" || questionType === "comment") && processedData && (
                <div className="min-h-[400px]">
                  <WordCloud words={processedData as TextResponseData} />
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-[1400px]">
              {isNps ? (
                isNpsComparisonData(processedData) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {processedData.map((groupData) => (
                      <div key={groupData.dimension} className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-lg font-semibold mb-4">{groupData.dimension}</h3>
                        <NpsChart 
                          data={[
                            { rating: 0, count: groupData.detractors },
                            { rating: 7, count: groupData.passives },
                            { rating: 9, count: groupData.promoters }
                          ]} 
                        />
                      </div>
                    ))}
                  </div>
                )
              ) : (
                isSatisfactionDataArray(processedData) && (
                  <HeatMapChart 
                    data={processedData}
                    title={getDimensionTitle(slideType)}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}