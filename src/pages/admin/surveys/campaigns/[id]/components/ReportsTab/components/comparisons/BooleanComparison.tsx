import { Card } from "@/components/ui/card";
import { ProcessedResponse } from "../../hooks/useResponseProcessing";
import { ComparisonDimension } from "../../types/comparison";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BooleanComparisonProps {
  responses: ProcessedResponse[];
  questionName: string;
  dimension: ComparisonDimension;
}

export function BooleanComparison({
  responses,
  questionName,
  dimension,
}: BooleanComparisonProps) {
  const processData = () => {
    const groupedData: Record<string, { yes: number; no: number }> = {};

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
        groupedData[groupKey] = { yes: 0, no: 0 };
      }

      if (answer === true) {
        groupedData[groupKey].yes++;
      } else if (answer === false) {
        groupedData[groupKey].no++;
      }
    });

    return Object.entries(groupedData).map(([name, data]) => ({
      name,
      Yes: data.yes,
      No: data.no,
    }));
  };

  const data = processData();

  return (
    <Card className="p-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Yes" fill="#22c55e" />
          <Bar dataKey="No" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}