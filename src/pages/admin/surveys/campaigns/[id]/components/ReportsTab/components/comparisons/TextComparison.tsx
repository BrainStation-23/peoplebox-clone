import { Card } from "@/components/ui/card";
import { ProcessedResponse } from "../../hooks/useResponseProcessing";
import { ComparisonDimension } from "../../types/comparison";
import { WordCloud } from "../../charts/WordCloud";

interface TextComparisonProps {
  responses: ProcessedResponse[];
  questionName: string;
  dimension: ComparisonDimension;
  layout?: 'grid' | 'vertical';
}

export function TextComparison({
  responses,
  questionName,
  dimension,
  layout = 'vertical'
}: TextComparisonProps) {
  const processData = () => {
    const groupedData: Record<string, Record<string, number>> = {};

    responses.forEach((response) => {
      const answer = response.answers[questionName]?.answer;
      let groupKey = "Unknown";

      switch (dimension) {
        case "sbu":
          groupKey = response.respondent.sbu?.name || "No SBU";
          break;
        case "gender":
          groupKey = response.respondent.gender || "Not Specified";
          break;
        case "location":
          groupKey = response.respondent.location?.name || "No Location";
          break;
        case "employment_type":
          groupKey = response.respondent.employment_type?.name || "Not Specified";
          break;
      }

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {};
      }

      if (typeof answer === "string") {
        const words = answer
          .toLowerCase()
          .replace(/[^\w\s]/g, "")
          .split(/\s+/)
          .filter((word) => word.length > 2);

        words.forEach((word) => {
          groupedData[groupKey][word] = (groupedData[groupKey][word] || 0) + 1;
        });
      }
    });

    return Object.entries(groupedData).map(([group, wordFreq]) => ({
      group,
      words: Object.entries(wordFreq)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 30),
    }));
  };

  const groupedWords = processData();

  return (
    <div className={layout === 'grid' ? 'grid grid-cols-1 gap-4' : 'space-y-4'}>
      {groupedWords.map(({ group, words }) => (
        <Card key={group} className="p-4">
          <h3 className="mb-4 text-lg font-semibold">{group}</h3>
          <div className="h-[300px]">
            <WordCloud words={words} />
          </div>
        </Card>
      ))}
    </div>
  );
}