import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProcessedAnswer {
  question: string;
  answer: any;
  questionType: string;
  rateCount?: number;  // Added this property
}

export interface ProcessedResponse {
  id: string;
  respondent: {
    name: string;
    email: string;
    gender: string | null;
    location: {
      id: string;
      name: string;
    } | null;
    sbu: {
      id: string;
      name: string;
    } | null;
    employment_type: {
      id: string;
      name: string;
    } | null;
  };
  submitted_at: string;
  answers: Record<string, ProcessedAnswer>;
}

interface Question {
  name: string;
  title: string;
  type: string;
  rateCount?: number;
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

      // Build the query for responses with extended user metadata
      let query = supabase
        .from("survey_responses")
        .select(`
          id,
          response_data,
          submitted_at,
          user:profiles!survey_responses_user_id_fkey (
            first_name,
            last_name,
            email,
            gender,
            location:locations (
              id,
              name
            ),
            employment_type:employment_types (
              id,
              name
            ),
            user_sbus:user_sbus (
              is_primary,
              sbu:sbus (
                id,
                name
              )
            )
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
            rateCount: question.rateCount // Add rateCount to the processed answer
          };
        });

        // Find primary SBU
        const primarySbu = response.user.user_sbus?.find(
          (us: any) => us.is_primary && us.sbu
        );

        return {
          id: response.id,
          respondent: {
            name: `${response.user.first_name || ""} ${
              response.user.last_name || ""
            }`.trim(),
            email: response.user.email,
            gender: response.user.gender,
            location: response.user.location,
            sbu: primarySbu?.sbu || null,
            employment_type: response.user.employment_type,
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
          rateCount: q.rateCount,
        })),
        responses: processedResponses,
      };
    },
  });
}