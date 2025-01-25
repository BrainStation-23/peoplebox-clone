import { supabase } from "@/integrations/supabase/client";
import type { ResponseData, SurveyData, Question } from "../types";

export async function fetchCampaignData(campaignId: string) {
  const { data, error } = await supabase
    .from("survey_campaigns")
    .select(`
      *,
      survey:surveys (
        id,
        name,
        json_data
      )
    `)
    .eq("id", campaignId)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchCampaignStatistics(campaignId: string) {
  const { data: assignments, error } = await supabase
    .from("survey_assignments")
    .select(`
      id,
      status,
      responses:survey_responses (
        id
      )
    `)
    .eq("campaign_id", campaignId);

  if (error) throw error;

  const totalResponses = assignments?.length || 0;
  const completed = assignments?.filter(a => a.status === "completed").length || 0;

  return {
    totalResponses,
    completionRate: (completed / totalResponses) * 100,
    statusDistribution: {
      completed,
      pending: totalResponses - completed,
    },
  };
}

export async function fetchResponses(campaignId: string): Promise<ResponseData[]> {
  const { data: campaign } = await supabase
    .from("survey_campaigns")
    .select(`
      survey:surveys (
        json_data
      )
    `)
    .eq("id", campaignId)
    .single();

  const surveyData = campaign?.survey?.json_data as SurveyData;
  const surveyQuestions = surveyData?.pages?.flatMap(
    (page) => page.elements || []
  ) || [];

  const { data, error } = await supabase
    .from("survey_responses")
    .select(`
      id,
      response_data,
      user:profiles!survey_responses_user_id_fkey (
        first_name,
        last_name,
        email,
        gender,
        location:locations (
          name
        ),
        employment_type:employment_types (
          name
        ),
        user_sbus:user_sbus (
          is_primary,
          sbu:sbus (
            name
          )
        )
      )
    `)
    .eq("assignment.campaign_id", campaignId);

  if (error) throw error;

  return data.map(response => {
    // Transform response_data into the expected format
    const answers: Record<string, { question: string; answer: any; questionType: string }> = {};
    
    // Process each question and its answer
    surveyQuestions.forEach((question: Question) => {
      const answer = response.response_data[question.name];
      if (answer !== undefined) {
        answers[question.name] = {
          question: question.title || question.name,
          answer: answer,
          questionType: question.type,
        };
      }
    });

    return {
      id: response.id,
      answers,
      respondent: {
        name: `${response.user.first_name || ""} ${response.user.last_name || ""}`.trim(),
        email: response.user.email,
        gender: response.user.gender,
        location: response.user.location,
        sbu: response.user.user_sbus?.find((us: any) => us.is_primary)?.sbu || null,
        employment_type: response.user.employment_type,
      },
    };
  });
}

export function processDemographicData(responses: ResponseData[]) {
  const demographics = {
    gender: new Map<string, number>(),
    location: new Map<string, number>(),
    employmentType: new Map<string, number>(),
    sbu: new Map<string, number>(),
  };

  responses.forEach(response => {
    const gender = response.respondent.gender || "Not Specified";
    const location = response.respondent.location?.name || "Not Specified";
    const employmentType = response.respondent.employment_type?.name || "Not Specified";
    const sbu = response.respondent.sbu?.name || "Not Specified";

    demographics.gender.set(gender, (demographics.gender.get(gender) || 0) + 1);
    demographics.location.set(location, (demographics.location.get(location) || 0) + 1);
    demographics.employmentType.set(employmentType, (demographics.employmentType.get(employmentType) || 0) + 1);
    demographics.sbu.set(sbu, (demographics.sbu.get(sbu) || 0) + 1);
  });

  const total = responses.length;

  return {
    gender: Array.from(demographics.gender.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: (count / total) * 100,
    })),
    location: Array.from(demographics.location.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: (count / total) * 100,
    })),
    employmentType: Array.from(demographics.employmentType.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: (count / total) * 100,
    })),
    sbu: Array.from(demographics.sbu.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: (count / total) * 100,
    })),
  };
}