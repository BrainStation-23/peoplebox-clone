import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProcessedAnswer {
  question: string;
  answer: any;
  questionType: string;
}

export interface ProcessedResponse {
  id: string;
  respondent: {
    name: string;
    email: string;
  };
  submitted_at: string;
  answers: Record<string, ProcessedAnswer>;
}

interface Question {
  name: string;
  title: string;
  type: string;
}

interface ProcessedData {
  questions: Question[];
  responses: ProcessedResponse[];
}

export function useResponseProcessing(campaignId: string, instanceId?: string) {
  return useQuery<ProcessedData>({
    queryKey: ["campaign-report", campaignId, instanceId],
    queryFn: async () => {
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
          id,
          response_data,
          submitted_at,
          user:profiles!survey_responses_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `);

      // If instanceId is provided, filter by it
      if (instanceId) {
        query = query.eq("campaign_instance_id", instanceId);
      }

      const { data: responses } = await query;

      if (!responses) {
        return {
          questions: surveyQuestions,
          responses: [],
        };
      }

      // Process each response
      const processedResponses: ProcessedResponse[] = responses.map((response) => {
        const answers: Record<string, ProcessedAnswer> = {};

        // Map each question to its answer
        surveyQuestions.forEach((question: any) => {
          const answer = response.response_data[question.name];
          answers[question.name] = {
            question: question.title,
            answer: answer,
            questionType: question.type,
          };
        });

        return {
          id: response.id,
          respondent: {
            name: `${response.user.first_name || ""} ${
              response.user.last_name || ""
            }`.trim(),
            email: response.user.email,
          },
          submitted_at: response.submitted_at,
          answers,
        };
      });

      return {
        questions: surveyQuestions.map((q: any) => ({
          name: q.name,
          title: q.title,
          type: q.type,
        })),
        responses: processedResponses,
      };
    },
  });
}