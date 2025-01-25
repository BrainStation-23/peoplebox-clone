import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Fullscreen, StickyNote } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from "date-fns";

interface SurveyQuestion {
  name: string;
  title: string;
  type: string;
}

interface SurveyData {
  id: string;
  name: string;
  description: string | null;
  json_data: {
    pages?: Array<{
      elements?: SurveyQuestion[];
    }>;
  };
}

interface CampaignData {
  id: string;
  name: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  completion_rate: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function PresentationView() {
  const { id: campaignId } = useParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const [chartScale, setChartScale] = useState(1);

  const { data: campaignData, isLoading: isCampaignLoading } = useQuery({
    queryKey: ["campaign-details", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_campaigns")
        .select(`
          id,
          name,
          description,
          starts_at,
          ends_at,
          completion_rate,
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
    },
  });

  const { data: statusData } = useQuery({
    queryKey: ["campaign-status-distribution", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_assignments")
        .select("status, id")
        .eq("campaign_id", campaignId);

      if (error) throw error;

      const distribution = data.reduce((acc: Record<string, number>, assignment) => {
        const status = assignment.status || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(distribution).map(([name, value]) => ({
        name,
        value,
      }));
    },
  });

  const { data: trendsData } = useQuery({
    queryKey: ["completion-trends", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_responses")
        .select(`
          created_at,
          assignment:survey_assignments!inner(
            campaign_id
          )
        `)
        .eq("assignment.campaign_id", campaignId)
        .order("created_at");

      if (error) throw error;

      const responsesByDate = data.reduce((acc: Record<string, number>, response) => {
        const date = format(new Date(response.created_at), "MMM d");
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(responsesByDate).map(([date, count]) => ({
        date,
        responses: count,
      }));
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

  if (isCampaignLoading) {
    return <div>Loading presentation...</div>;
  }

  if (!campaignData) {
    return <div>No data available</div>;
  }

  const surveyQuestions = campaignData.survey.json_data.pages?.flatMap(
    (page) => page.elements || []
  ) || [];

  const totalSlides = 3 + surveyQuestions.length; // Title, Status, Trends + Questions

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
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

  const renderSlide = () => {
    if (currentSlide === 0) {
      // Title & Overview Slide
      return (
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-4xl font-bold">{campaignData.name}</h1>
          {campaignData.description && (
            <p className="text-xl text-gray-300">{campaignData.description}</p>
          )}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Campaign Period</h3>
              <p>{format(new Date(campaignData.starts_at), "MMM d, yyyy")} - {format(new Date(campaignData.ends_at), "MMM d, yyyy")}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Completion Rate</h3>
              <p className="text-2xl font-bold">{campaignData.completion_rate?.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      );
    } else if (currentSlide === 1) {
      // Status Distribution Slide
      return (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6">Response Status Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    } else if (currentSlide === 2) {
      // Completion Trends Slide
      return (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6">Response Trends</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="responses" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    // Question Slides
    const questionIndex = currentSlide - 3;
    const currentQuestion = surveyQuestions[questionIndex];
    if (!currentQuestion) return null;

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6">{currentQuestion.title}</h2>
        {/* Render question-specific content here */}
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-black text-white p-8 transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">{campaignData.name}</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              Slide {currentSlide + 1} of {totalSlides}
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
              {renderSlide()}
            </CardContent>
          </Card>

          {showPresenterNotes && (
            <Card className="bg-gray-900 border-gray-800 animate-slide-in-right">
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold mb-4">Presenter Notes</h3>
                <div className="space-y-4">
                  {currentSlide === 0 && (
                    <>
                      <p>Campaign Overview</p>
                      <p>Duration: {format(new Date(campaignData.starts_at), "MMM d, yyyy")} - {format(new Date(campaignData.ends_at), "MMM d, yyyy")}</p>
                      <p>Current Completion: {campaignData.completion_rate?.toFixed(1)}%</p>
                    </>
                  )}
                  {currentSlide === 1 && (
                    <p>Status Distribution showing completion rates across different states</p>
                  )}
                  {currentSlide === 2 && (
                    <p>Response trends over time showing participation patterns</p>
                  )}
                  {currentSlide > 2 && (
                    null
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
            disabled={currentSlide === totalSlides - 1}
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
