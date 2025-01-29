import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUESTION_PROCESSORS } from "../types/processors";
import type { ProcessedData } from "../types/processors/base";

interface ProcessedQuestion {
  name: string;
  title: string;
  type: string;
  data: ProcessedData;
}

interface UseProcessedResponsesResult {
  questions: ProcessedQuestion[];
  isLoading: boolean;
  error: Error | null;
}

export function useProcessedResponses(campaignId: string, instanceId?: string): UseProcessedResponsesResult {
  const { data: questions = [], isLoading, error } = useQuery({
    queryKey: ["processed-responses", campaignId, instanceId],
    queryFn: async () => {
      console.log("Fetching responses for processing:", { campaignId, instanceId });

      // First get the survey details and its questions
      const { data: campaign } = await supabase
        .from("survey_campaigns")
        .select(`
          survey:surveys (
            id,
            name,
            json_data
          )
        `)
        .eq("id", campaignId)
        .single();

      if (!campaign?.survey) {
        throw new Error("Survey not found");
      }

      const surveyData = typeof campaign.survey.json_data === 'string' 
        ? JSON.parse(campaign.survey.json_data)
        : campaign.survey.json_data;

      const surveyQuestions = surveyData.pages?.flatMap(
        (page: any) => page.elements || []
      ) || [];

      // Build the query for responses
      let query = supabase
        .from("survey_responses")
        .select(`
          response_data,
          campaign_instance_id
        `);

      if (instanceId) {
        query = query.eq("campaign_instance_id", instanceId);
      }

      const { data: responses } = await query;

      if (!responses) {
        return [];
      }

      // Process each question using appropriate processor
      const processedQuestions = surveyQuestions.map((question: any) => {
        const processorFactory = QUESTION_PROCESSORS[question.type];
        
        if (!processorFactory) {
          console.warn(`No processor found for question type: ${question.type}`);
          return null;
        }

        const processor = processorFactory();
        const questionResponses = responses.map(r => ({
          answer: r.response_data[question.name]
        }));

        return {
          name: question.name,
          title: question.title,
          type: question.type,
          data: processor.process(questionResponses)
        };
      }).filter(Boolean);

      return processedQuestions;
    }
  });

  return {
    questions,
    isLoading,
    error: error as Error | null
  };
}