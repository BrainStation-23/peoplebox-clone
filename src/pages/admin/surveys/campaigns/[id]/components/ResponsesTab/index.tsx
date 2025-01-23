import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ResponseGroup } from "./ResponseGroup";
import { processResponses } from "./utils/responseAnalyzer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SingleChoiceChart } from "./components/QuestionAnalytics/SingleChoiceChart";
import { NPSVisualizer } from "./components/QuestionAnalytics/NPSVisualizer";
import type { FilterOptions, Response } from "./types";
import type { QuestionAnalysis } from "./types/reports";

interface ResponsesTabProps {
  instanceId?: string;
}

export function ResponsesTab({ instanceId }: ResponsesTabProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    sortBy: "date",
    sortDirection: "desc",
  });

  const { data: surveyData } = useQuery({
    queryKey: ["survey-data", instanceId],
    queryFn: async () => {
      if (!instanceId) return null;
      
      const { data: responses } = await supabase
        .from("survey_responses")
        .select(`
          assignment:survey_assignments!survey_responses_assignment_id_fkey (
            survey:surveys (
              id,
              json_data
            )
          )
        `)
        .eq("campaign_instance_id", instanceId)
        .limit(1)
        .maybeSingle();

      return responses?.assignment?.survey;
    },
    enabled: !!instanceId,
  });

  const { data: responses = [], isLoading } = useQuery({
    queryKey: ["campaign-responses", instanceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_responses")
        .select(`
          id,
          response_data,
          submitted_at,
          created_at,
          updated_at,
          user:profiles!survey_responses_user_id_fkey (
            id,
            first_name,
            last_name,
            email
          ),
          assignment:survey_assignments!survey_responses_assignment_id_fkey (
            id,
            campaign_id
          )
        `)
        .eq("campaign_instance_id", instanceId);

      if (error) {
        console.error("Error fetching responses:", error);
        throw error;
      }

      return data as Response[];
    },
    enabled: !!instanceId,
  });

  // Filter and sort responses based on current filters
  const filteredAndSortedResponses = [...responses].filter(response => {
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    return (
      response.user.email.toLowerCase().includes(searchTerm) ||
      (response.user.first_name && response.user.first_name.toLowerCase().includes(searchTerm)) ||
      (response.user.last_name && response.user.last_name.toLowerCase().includes(searchTerm))
    );
  }).sort((a, b) => {
    const direction = filters.sortDirection === "asc" ? 1 : -1;
    if (filters.sortBy === "date") {
      return direction * (new Date(a.submitted_at || 0).getTime() - new Date(b.submitted_at || 0).getTime());
    }
    return direction * (a.user.email.localeCompare(b.user.email));
  });

  const analysisData: QuestionAnalysis[] = responses && surveyData?.json_data
    ? processResponses(surveyData.json_data, responses.map(r => ({
        response_data: typeof r.response_data === 'object' && r.response_data !== null 
          ? r.response_data as Record<string, any>
          : {},
        user_id: r.user.id,
        submitted_at: r.submitted_at || "",
      })))
    : [];

  const renderQuestionAnalysis = (analysis: QuestionAnalysis) => {
    switch (analysis.question.type) {
      case "nps":
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">{analysis.question.title}</h3>
            <NPSVisualizer 
              promoters={analysis.summary.promoters || 0}
              passives={analysis.summary.passives || 0}
              detractors={analysis.summary.detractors || 0}
              npsScore={analysis.summary.npsScore || 0}
              title={analysis.question.title}
            />
          </div>
        );
      case "radiogroup":
      case "checkbox":
        if (!analysis.summary) return null;
        const chartData = Object.entries(analysis.summary)
          .filter(([key]) => key !== "totalResponses")
          .map(([name, value]) => ({ name, value: value as number }));
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">{analysis.question.title}</h3>
            <SingleChoiceChart 
              data={chartData}
              title={analysis.question.title} 
            />
          </div>
        );
      default:
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">{analysis.question.title}</h3>
            <p className="text-sm text-muted-foreground">
              {analysis.summary.totalResponses} responses
            </p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-full animate-pulse bg-muted rounded" />
        <div className="h-32 w-full animate-pulse bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Response List</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search respondents..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="flex-1"
            />
            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                sortBy: value as FilterOptions["sortBy"]
              }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortDirection}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                sortDirection: value as FilterOptions["sortDirection"] 
              }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ResponseGroup responses={filteredAndSortedResponses} />
        </TabsContent>

        <TabsContent value="analysis">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Response Analysis</h2>
            {analysisData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No responses available for analysis.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysisData.map((analysis) => (
                  <div key={analysis.question.name} className="border rounded-lg">
                    {renderQuestionAnalysis(analysis)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}