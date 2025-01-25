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

interface NpsComparisonProps {
  responses: ProcessedResponse[];
  questionName: string;
  dimension: ComparisonDimension;
}

export function NpsComparison({
  responses,
  questionName,
  dimension,
}: NpsComparisonProps) {
  const processData = () => {
    const groupedData: Record<
      string,
      { detractors: number; passives: number; promoters: number; total: number }
    > = {};

    responses.forEach((response) => {
      const score = response.answers[questionName]?.answer;
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
        groupedData[groupKey] = {
          detractors: 0,
          passives: 0,
          promoters: 0,
          total: 0,
        };
      }

      if (typeof score === "number") {
        if (score <= 6) {
          groupedData[groupKey].detractors++;
        } else if (score <= 8) {
          groupedData[groupKey].passives++;
        } else {
          groupedData[groupKey].promoters++;
        }
        groupedData[groupKey].total++;
      }
    });

    return Object.entries(groupedData).map(([name, data]) => ({
      name,
      NPS: Math.round(
        ((data.promoters - data.detractors) / data.total) * 100
      ),
    }));
  };

  const data = processData();

  return (
    <Card className="p-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[-100, 100]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="NPS" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}