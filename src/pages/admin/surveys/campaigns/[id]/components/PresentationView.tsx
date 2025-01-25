import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function PresentationView() {
  const { id: campaignId } = useParams();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: surveyData, isLoading: isSurveyLoading } = useQuery({
    queryKey: ["campaign-survey", campaignId],
    queryFn: async () => {
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

      return campaign.survey;
    },
  });

  const { data: responses, isLoading: isResponsesLoading } = useQuery({
    queryKey: ["campaign-responses", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_responses")
        .select(`
          response_data,
          assignment:survey_assignments!inner(
            campaign_id
          )
        `)
        .eq("assignment.campaign_id", campaignId);

      if (error) throw error;
      return data || [];
    },
  });

  if (isSurveyLoading || isResponsesLoading) {
    return <div>Loading presentation...</div>;
  }

  if (!surveyData || !responses) {
    return <div>No data available</div>;
  }

  const surveyQuestions = surveyData.json_data.pages?.flatMap(
    (page: any) => page.elements || []
  ) || [];

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => 
      Math.min(surveyQuestions.length - 1, prev + 1)
    );
  };

  const currentQuestion = surveyQuestions[currentSlide];
  if (!currentQuestion) return null;

  const questionResponses = responses.map(
    (response) => response.response_data[currentQuestion.name]
  ).filter(Boolean);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">{surveyData.name}</h1>
          <div className="text-sm">
            Slide {currentSlide + 1} of {surveyQuestions.length}
          </div>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold mb-6">
              {currentQuestion.title}
            </h2>

            <div className="space-y-4">
              {questionResponses.length > 0 ? (
                questionResponses.map((response, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-800 rounded-lg"
                  >
                    {typeof response === "boolean" ? (
                      response ? "Yes" : "No"
                    ) : (
                      response
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-400">No responses yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevSlide}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={handleNextSlide}
            disabled={currentSlide === surveyQuestions.length - 1}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}