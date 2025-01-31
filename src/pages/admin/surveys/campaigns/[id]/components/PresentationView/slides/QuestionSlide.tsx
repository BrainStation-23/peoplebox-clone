import { SlideProps } from "../types";
import { cn } from "@/lib/utils";
import { BooleanCharts } from "../../ReportsTab/charts/BooleanCharts";
import { NpsChart } from "../../ReportsTab/charts/NpsChart";
import { WordCloud } from "../../ReportsTab/charts/WordCloud";
import { HeatMapChart } from "../../ReportsTab/charts/HeatMapChart";
import { usePresentationResponses } from "../hooks/usePresentationResponses";
import { ComparisonDimension } from "../../ReportsTab/types/comparison";

interface QuestionSlideProps extends SlideProps {
  questionName: string;
  questionTitle: string;
  questionType: string;
  slideType: 'main' | ComparisonDimension;
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

    if (slideType === 'main') {
      switch (questionType) {
        case "boolean": {
          const answers = responses
            .filter(r => r.answers[questionName]?.answer !== undefined)
            .map(r => r.answers[questionName].answer);
          
          return {
            yes: answers.filter((a) => a === true).length,
            no: answers.filter((a) => a === false).length,
          };
        }

        case "rating": {
          const answers = responses
            .filter(r => typeof r.answers[questionName]?.answer === 'number')
            .map(r => r.answers[questionName].answer);

          const isNps = question?.rateCount === 10;
          
          if (isNps) {
            const ratingCounts = new Array(11).fill(0);
            answers.forEach((rating) => {
              if (typeof rating === "number" && rating >= 0 && rating <= 10) {
                ratingCounts[rating]++;
              }
            });

            return ratingCounts.map((count, rating) => ({ 
              rating, 
              count,
            }));
          } else {
            const validAnswers = answers.filter(
              (rating) => typeof rating === "number" && rating >= 1 && rating <= 5
            );
            
            return {
              unsatisfied: validAnswers.filter((r) => r <= 3).length,
              neutral: validAnswers.filter((r) => r === 4).length,
              satisfied: validAnswers.filter((r) => r === 5).length,
              total: validAnswers.length,
            };
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

          return Object.entries(wordFrequency)
            .map(([text, value]) => ({ text, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 50);
        }

        default:
          return null;
      }
    } else {
      const dimensionData = new Map<string, {
        dimension: string;
        unsatisfied: number;
        neutral: number;
        satisfied: number;
        total: number;
      }>();

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
            unsatisfied: 0,
            neutral: 0,
            satisfied: 0,
            total: 0
          });
        }

        const group = dimensionData.get(dimensionValue)!;
        group.total += 1;

        if (answer <= 3) {
          group.unsatisfied += 1;
        } else if (answer === 4) {
          group.neutral += 1;
        } else {
          group.satisfied += 1;
        }
      });

      return Array.from(dimensionData.values());
    }
  };

  const processedData = processAnswers();
  const question = data?.questions.find(q => q.name === questionName);
  const isNpsQuestion = question?.type === 'rating' && question?.rateCount === 10;

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
              {questionType === "boolean" && (
                <BooleanCharts data={processedData} />
              )}
              {questionType === "rating" && (
                isNpsQuestion ? (
                  <NpsChart data={processedData} />
                ) : (
                  <HeatMapChart 
                    data={[processedData]} 
                    title="Overall Satisfaction Distribution"
                  />
                )
              )}
              {(questionType === "text" || questionType === "comment") && (
                <div className="min-h-[400px]">
                  <WordCloud words={processedData} />
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-[1400px]">
              <HeatMapChart 
                data={processedData} 
                title={getDimensionTitle(slideType)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
