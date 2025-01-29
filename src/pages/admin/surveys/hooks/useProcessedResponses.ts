import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUESTION_PROCESSORS } from "../types/processors";

interface BooleanData {
  yes: number;
  no: number;
}

interface NpsData {
  rating: number;
  count: number;
}

interface WordData {
  text: string;
  value: number;
}

interface ProcessedQuestion {
  name: string;
  title: string;
  type: string;
  data: {
    responses: BooleanData | NpsData[] | WordData[];
  };
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

        // Transform the data based on question type
        let transformedData;
        switch (question.type) {
          case 'boolean':
            const booleanResponses = questionResponses.map(r => r.answer);
            transformedData = {
              yes: booleanResponses.filter((answer: boolean) => answer === true).length,
              no: booleanResponses.filter((answer: boolean) => answer === false).length
            };
            break;

          case 'nps':
          case 'rating':
            const ratingCounts = new Array(11).fill(0);
            questionResponses.forEach(r => {
              if (typeof r.answer === 'number' && r.answer >= 0 && r.answer <= 10) {
                ratingCounts[r.answer]++;
              }
            });
            transformedData = ratingCounts.map((count, rating) => ({
              rating,
              count
            }));
            break;

          case 'text':
          case 'comment':
            const words = questionResponses
              .map(r => r.answer)
              .filter((text: string) => text)
              .flatMap((text: string) => 
                text.toLowerCase()
                  .replace(/[^\w\s]/g, '')
                  .split(/\s+/)
              )
              .filter((word: string) => word.length > 2);

            const wordFreq: Record<string, number> = {};
            words.forEach((word: string) => {
              wordFreq[word] = (wordFreq[word] || 0) + 1;
            });

            transformedData = Object.entries(wordFreq)
              .map(([text, value]) => ({ text, value }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 50);
            break;

          default:
            transformedData = [];
        }

        return {
          name: question.name,
          title: question.title,
          type: question.type,
          data: {
            responses: transformedData
          }
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