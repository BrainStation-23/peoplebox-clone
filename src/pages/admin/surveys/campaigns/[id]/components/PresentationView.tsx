import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Fullscreen, StickyNote } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SurveyQuestion {
  name: string;
  title: string;
  type: string;
}

interface SurveyData {
  id: string;
  name: string;
  json_data: {
    pages?: Array<{
      elements?: SurveyQuestion[];
    }>;
  };
}

export default function PresentationView() {
  const { id: campaignId } = useParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const [chartScale, setChartScale] = useState(1);

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

      return campaign.survey as SurveyData;
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

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowLeft":
        handlePrevSlide();
        break;
      case "ArrowRight":
        handleNextSlide();
        break;
      case "f":
        toggleFullscreen();
        break;
      case "n":
        setShowPresenterNotes(prev => !prev);
        break;
      case "+":
        setChartScale(prev => Math.min(prev + 0.1, 2));
        break;
      case "-":
        setChartScale(prev => Math.max(prev - 0.1, 0.5));
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  if (isSurveyLoading || isResponsesLoading) {
    return <div>Loading presentation...</div>;
  }

  if (!surveyData || !responses) {
    return <div>No data available</div>;
  }

  const surveyQuestions = surveyData.json_data.pages?.flatMap(
    (page) => page.elements || []
  ) || [];

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => 
      Math.min(surveyQuestions.length - 1, prev + 1)
    );
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const currentQuestion = surveyQuestions[currentSlide];
  if (!currentQuestion) return null;

  const questionResponses = responses.map(
    (response) => response.response_data[currentQuestion.name]
  ).filter(Boolean);

  const getChartData = () => {
    if (typeof questionResponses[0] === 'boolean') {
      const trueCount = questionResponses.filter(r => r === true).length;
      const falseCount = questionResponses.filter(r => r === false).length;
      return [
        { name: 'Yes', value: trueCount },
        { name: 'No', value: falseCount }
      ];
    }

    const counts = questionResponses.reduce((acc: Record<string, number>, curr) => {
      const key = String(curr);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  return (
    <div className={`min-h-screen bg-black text-white p-8 transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">{surveyData.name}</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              Slide {currentSlide + 1} of {surveyQuestions.length}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowPresenterNotes(prev => !prev)}
            >
              <StickyNote className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
            >
              <Fullscreen className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className={`bg-gray-900 border-gray-800 transition-all duration-300 ${showPresenterNotes ? 'md:col-span-2' : 'md:col-span-3'}`}>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold mb-6 animate-fade-in">
                {currentQuestion.title}
              </h2>

              {questionResponses.length > 0 ? (
                <div className="space-y-8">
                  <div 
                    className="h-[300px] transition-transform duration-300"
                    style={{ transform: `scale(${chartScale})` }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getChartData()} className="animate-fade-in">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    {questionResponses.map((response, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-800 rounded-lg animate-fade-in"
                        style={{
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        {typeof response === "boolean" ? (
                          response ? "Yes" : "No"
                        ) : (
                          response
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">No responses yet</div>
              )}
            </CardContent>
          </Card>

          {showPresenterNotes && (
            <Card className="bg-gray-900 border-gray-800 animate-slide-in-right">
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold mb-4">Presenter Notes</h3>
                <div className="space-y-4">
                  <p>Response Rate: {questionResponses.length} responses</p>
                  <p>Question Type: {currentQuestion.type}</p>
                  {typeof questionResponses[0] === 'boolean' && (
                    <p>
                      Yes/No Distribution: {
                        Math.round((questionResponses.filter(r => r === true).length / questionResponses.length) * 100)
                      }% Yes
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevSlide}
            disabled={currentSlide === 0}
            className="animate-fade-in"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={handleNextSlide}
            disabled={currentSlide === surveyQuestions.length - 1}
            className="animate-fade-in"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}