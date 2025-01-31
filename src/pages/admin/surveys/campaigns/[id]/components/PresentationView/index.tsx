import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft, Fullscreen } from "lucide-react";
import { CampaignData } from "./types";
import { TitleSlide } from "./slides/TitleSlide";
import { CompletionRateSlide } from "./slides/CompletionRateSlide";
import { ResponseDistributionSlide } from "./slides/ResponseDistributionSlide";
import { ResponseTrendsSlide } from "./slides/ResponseTrendsSlide";
import { QuestionSlide } from "./slides/QuestionSlide";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ComparisonDimension } from "../ReportsTab/types/comparison";

const COMPARISON_DIMENSIONS: ComparisonDimension[] = ['sbu', 'gender', 'location', 'employment_type'];

export default function PresentationView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const instanceId = searchParams.get('instance');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!instanceId) {
      toast({
        title: "No instance selected",
        description: "Please select an instance from the campaign page",
        variant: "destructive",
      });
      navigate(`/admin/surveys/campaigns/${id}`);
    }
  }, [instanceId, id, navigate, toast]);

  const { data: campaign } = useQuery({
    queryKey: ["campaign", id, instanceId],
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

      // Fetch instance data
      const { data: instance, error: instanceError } = await supabase
        .from("campaign_instances")
        .select("*")
        .eq("id", instanceId)
        .single();

      if (instanceError) throw instanceError;
      
      return {
        ...data,
        instance,
        survey: {
          ...data.survey,
          json_data: data.survey.json_data
        }
      } as CampaignData;
    },
    enabled: !!id && !!instanceId,
  });

  const surveyQuestions = (campaign?.survey.json_data.pages || []).flatMap(
    (page) => page.elements || []
  );

  // Calculate total slides including comparison slides
  const totalSlides = 4 + (surveyQuestions.length * (1 + COMPARISON_DIMENSIONS.length));

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
  }, [totalSlides]);

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

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const handleBack = () => {
    navigate(`/admin/surveys/campaigns/${id}`);
  };

  const renderQuestionSlides = () => {
    return surveyQuestions.map((question, index) => {
      const baseSlideIndex = 4 + (index * (1 + COMPARISON_DIMENSIONS.length));
      
      // Main question slide
      const slides = [(
        <QuestionSlide
          key={`${question.name}-main`}
          campaign={campaign}
          isActive={currentSlide === baseSlideIndex}
          questionName={question.name}
          questionTitle={question.title}
          questionType={question.type}
          slideType="main"
        />
      )];

      // Comparison slides
      COMPARISON_DIMENSIONS.forEach((dimension, dimIndex) => {
        slides.push(
          <QuestionSlide
            key={`${question.name}-${dimension}`}
            campaign={campaign}
            isActive={currentSlide === baseSlideIndex + dimIndex + 1}
            questionName={question.name}
            questionTitle={question.title}
            questionType={question.type}
            slideType={dimension}
          />
        );
      });

      return slides;
    });
  };

  if (!campaign) return null;

  return (
    <div className="h-full bg-background relative">
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
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
          />
        </div>

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

        <div className="h-full p-8">
          <div className="max-w-6xl mx-auto h-full">
            <TitleSlide campaign={campaign} isActive={currentSlide === 0} />
            <CompletionRateSlide campaign={campaign} isActive={currentSlide === 1} />
            <ResponseDistributionSlide campaign={campaign} isActive={currentSlide === 2} />
            <ResponseTrendsSlide campaign={campaign} isActive={currentSlide === 3} />
            {renderQuestionSlides()}
          </div>
        </div>
      </div>
    </div>
  );
}
