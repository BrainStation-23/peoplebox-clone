import { SlideProps } from "../types";
import { cn } from "@/lib/utils";
import { BooleanCharts } from "../../ReportsTab/charts/BooleanCharts";
import { NpsChart } from "../../ReportsTab/charts/NpsChart";
import { WordCloud } from "../../ReportsTab/charts/WordCloud";
import { SatisfactionDonutChart } from "../../ReportsTab/charts/SatisfactionDonutChart";
import { usePresentationResponses } from "../hooks/usePresentationResponses";
import { BooleanResponseData, RatingResponseData, SatisfactionResponseData, TextResponseData } from "../types/responses";
import { BooleanComparison } from "../../ReportsTab/components/comparisons/BooleanComparison";
import { NpsComparison } from "../../ReportsTab/components/comparisons/NpsComparison";
import { TextComparison } from "../../ReportsTab/components/comparisons/TextComparison";
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
  
  const processAnswers = (): BooleanResponseData | RatingResponseData | SatisfactionResponseData | TextResponseData | null => {
    if (!data?.responses) return null;

    const responses = data.responses;
    const question = data.questions.find(q => q.name === questionName);

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
          // Process as NPS (0-10)
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
          // Process as satisfaction (1-5)
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
  };

  const processedData = processAnswers();
  const question = data?.questions.find(q => q.name === questionName);
  const isNpsQuestion = question?.type === 'rating' && question?.rateCount === 10;

  const renderComparisonSlide = () => {
    if (!data?.responses) return null;

    switch (questionType) {
      case "boolean":
        return (
          <BooleanComparison
            responses={data.responses}
            questionName={questionName}
            dimension={slideType as ComparisonDimension}
          />
        );
      case "rating":
        return (
          <NpsComparison
            responses={data.responses}
            questionName={questionName}
            dimension={slideType as ComparisonDimension}
            isNps={isNpsQuestion}
          />
        );
      case "text":
      case "comment":
        return (
          <TextComparison
            responses={data.responses}
            questionName={questionName}
            dimension={slideType as ComparisonDimension}
          />
        );
      default:
        return null;
    }
  };

  const renderMainSlide = () => {
    if (!processedData) return null;

    return (
      <div className="w-full max-w-4xl">
        {questionType === "boolean" && (
          <BooleanCharts data={processedData as BooleanResponseData} />
        )}
        {questionType === "rating" && (
          isNpsQuestion ? (
            <NpsChart data={processedData as RatingResponseData} />
          ) : (
            <SatisfactionDonutChart data={processedData as SatisfactionResponseData} />
          )
        )}
        {(questionType === "text" || questionType === "comment") && (
          <div className="min-h-[400px]">
            <WordCloud words={processedData as TextResponseData} />
          </div>
        )}
      </div>
    );
  };

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
          {slideType !== 'main' && (
            <p className="text-lg text-muted-foreground mt-2">
              Comparison by {slideType.toUpperCase()}
            </p>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center">
          {slideType === 'main' ? renderMainSlide() : renderComparisonSlide()}
        </div>
      </div>
    </div>
  );
}