import { Card } from "@/components/ui/card";
import { ComparisonDimension } from "../../types/comparison";
import { WordCloud } from "../../charts/WordCloud";
import type { ProcessedResponse } from "@/pages/admin/surveys/hooks/useResponseProcessing";
import { useEffect } from "react";

interface TextComparisonProps {
  responses: ProcessedResponse[];
  questionName: string;
  dimension: ComparisonDimension;
}

export function TextComparison({
  responses,
  questionName,
  dimension,
}: TextComparisonProps) {
  const processData = () => {
    const groupedData: Record<string, Record<string, number>> = {};

    responses.forEach((response) => {
      const answer = response.answers[questionName]?.answer;
      let groupKey = "Unknown";

      // Get the group key based on the dimension
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

  useEffect(() => {
    console.log("TextComparison processed data:", groupedWords);
  }, [groupedWords]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {groupedWords.map(({ group, words }) => (
        <Card key={group} className="p-4">
          <h3 className="mb-4 text-lg font-semibold">{group}</h3>
          <div className="min-h-[400px]">
            <WordCloud words={words} />
          </div>
        </Card>
      ))}
    </div>
  );
}