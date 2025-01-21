import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Survey } from "./types";
import { BasicInfoForm, type BasicInfoFormData } from "./components/BasicInfoForm";
import { SurveyBuilder } from "./components/SurveyBuilder";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function SurveyFormPage() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic-info");
  const [basicInfo, setBasicInfo] = useState<BasicInfoFormData | null>(null);

  const { data: survey, isLoading } = useQuery({
    queryKey: ['survey', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Survey;
    },
    enabled: isEditMode,
  });

  const handleBasicInfoSubmit = async (data: BasicInfoFormData) => {
    if (isEditMode) {
      try {
        const { error } = await supabase
          .from('surveys')
          .update({
            name: data.name,
            description: data.description,
            tags: data.tags,
          })
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Survey information updated successfully",
        });
        setActiveTab("builder");
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to update survey information",
        });
      }
    } else {
      setBasicInfo(data);
      setActiveTab("builder");
    }
  };

  const handleSurveySubmit = async (jsonData: any) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to create a survey",
        });
        navigate('/login');
        return;
      }

      if (isEditMode) {
        const { error } = await supabase
          .from('surveys')
          .update({
            json_data: jsonData,
          })
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Survey updated successfully",
        });
      } else {
        if (!basicInfo) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Please fill in the basic information first",
          });
          setActiveTab("basic-info");
          return;
        }

        const { error } = await supabase.from("surveys").insert({
          name: basicInfo.name,
          description: basicInfo.description,
          tags: basicInfo.tags,
          json_data: jsonData,
          status: "draft",
          created_by: session.user.id,
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Survey created successfully",
        });
      }
      
      navigate("/admin/surveys");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} survey`,
      });
    }
  };

  if (isEditMode && isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit' : 'Create New'} Survey</CardTitle>
          <CardDescription>
            {isEditMode ? 'Modify' : 'Create'} a survey using our intuitive builder or import from Survey.js
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
              <TabsTrigger value="builder">Survey Builder</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic-info">
              <BasicInfoForm 
                onSubmit={handleBasicInfoSubmit} 
                defaultValues={
                  survey 
                    ? {
                        name: survey.name,
                        description: survey.description || "",
                        tags: survey.tags || [],
                      }
                    : basicInfo || undefined
                } 
              />
            </TabsContent>

            <TabsContent value="builder">
              <SurveyBuilder 
                onSubmit={handleSurveySubmit} 
                defaultValue={survey ? JSON.stringify(survey.json_data, null, 2) : undefined}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}