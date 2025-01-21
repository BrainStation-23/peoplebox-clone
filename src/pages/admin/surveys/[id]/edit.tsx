import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Survey } from "../types";
import { BasicInfoForm, type BasicInfoFormData } from "../components/BasicInfoForm";
import { SurveyBuilder } from "../components/SurveyBuilder";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditSurveyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic-info");

  const { data: survey, isLoading } = useQuery({
    queryKey: ['survey', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Survey;
    },
  });

  const handleBasicInfoSubmit = async (data: BasicInfoFormData) => {
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
  };

  const handleSurveySubmit = async (jsonData: any) => {
    try {
      const { error } = await supabase
        .from('surveys')
        .update({
          json_data: jsonData,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Survey structure updated successfully",
      });
      navigate("/admin/surveys");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update survey structure",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <p>Survey not found</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Survey</CardTitle>
          <CardDescription>
            Modify your survey's information and structure
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
                defaultValues={{
                  name: survey.name,
                  description: survey.description || "",
                  tags: survey.tags || [],
                }} 
              />
            </TabsContent>

            <TabsContent value="builder">
              <SurveyBuilder 
                onSubmit={handleSurveySubmit} 
                defaultValue={JSON.stringify(survey.json_data, null, 2)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}