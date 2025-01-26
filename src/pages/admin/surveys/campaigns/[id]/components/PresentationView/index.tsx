import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CampaignData, SurveyJsonData } from "./types";
import { TitleSlide } from "./slides/TitleSlide";
import { StatusDistributionSlide } from "./slides/StatusDistributionSlide";

export default function PresentationView() {
  const { id } = useParams();
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

      // Parse and validate json_data
      const jsonData = typeof data.survey.json_data === 'string' 
        ? JSON.parse(data.survey.json_data)
        : data.survey.json_data;

      // Ensure the data has the required structure
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

  const totalSlides = 2; // Update this as you add more slides

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="fixed inset-0 bg-background">
      <div className="relative h-full overflow-hidden">
        {/* Navigation Controls */}
        <div className="absolute top-4 right-4 z-10 space-x-2">
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          </Button>
        </div>

        <div className="absolute bottom-4 right-4 z-10 space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={previousSlide}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Slides */}
        <div className="h-full">
          <TitleSlide campaign={campaign} isActive={currentSlide === 0} />
          <StatusDistributionSlide campaign={campaign} isActive={currentSlide === 1} />
        </div>
      </div>
    </div>
  );
}