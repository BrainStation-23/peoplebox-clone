import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft, Fullscreen } from "lucide-react";
import { CampaignData, SurveyJsonData } from "./types";
import { TitleSlide } from "./slides/TitleSlide";
import { StatusDistributionSlide } from "./slides/StatusDistributionSlide";
import { cn } from "@/lib/utils";

export default function PresentationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: campaign } = useQuery({
    queryKey: ["campaign", id],
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
            description,
            json_data
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      const jsonData = typeof data.survey.json_data === 'string' 
        ? JSON.parse(data.survey.json_data)
        : data.survey.json_data;

      if (!jsonData || !Array.isArray(jsonData.pages)) {
        throw new Error('Invalid survey data structure');
      }

      const parsedData: CampaignData = {
        ...data,
        survey: {
          ...data.survey,
          json_data: jsonData as SurveyJsonData
        }
      };

      return parsedData;
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
      } else if (e.key === "f") {
        toggleFullscreen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!campaign) return null;

  const totalSlides = 2;

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const handleBack = () => {
    navigate(`/admin/surveys/campaigns/${id}`);
  };

  return (
    <div className="h-full bg-background relative">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-gray-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaign
        </Button>
      </div>

      <div className="relative h-full overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
          />
        </div>

        {/* Navigation Controls */}
        <div className="absolute top-4 right-4 z-10 space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFullscreen}
            className="bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-gray-200"
          >
            <Fullscreen className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute bottom-4 right-4 z-10 space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={previousSlide}
            disabled={currentSlide === 0}
            className={cn(
              "bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-gray-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className={cn(
              "bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-gray-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Slides Container */}
        <div className="h-full p-8">
          <div className="max-w-6xl mx-auto h-full">
            <TitleSlide campaign={campaign} isActive={currentSlide === 0} />
            <StatusDistributionSlide campaign={campaign} isActive={currentSlide === 1} />
          </div>
        </div>
      </div>
    </div>
  );
}