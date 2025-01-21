import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoForm, type BasicInfoFormData } from "./components/BasicInfoForm";
import { SurveyBuilder } from "./components/SurveyBuilder";

export default function CreateSurveyPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic-info");
  const [basicInfo, setBasicInfo] = useState<BasicInfoFormData | null>(null);

  const handleBasicInfoSubmit = async (data: BasicInfoFormData) => {
    setBasicInfo(data);
    setActiveTab("builder");
  };

  const handleSurveySubmit = async (jsonData: any) => {
    if (!basicInfo) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in the basic information first",
      });
      setActiveTab("basic-info");
      return;
    }

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
      navigate("/admin/surveys");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create survey",
      });
      console.error("Error creating survey:", error);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Survey</CardTitle>
          <CardDescription>
            Create a new survey using our intuitive builder or import from Survey.js
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
              <TabsTrigger value="builder">Survey Builder</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic-info">
              <BasicInfoForm onSubmit={handleBasicInfoSubmit} defaultValues={basicInfo || undefined} />
            </TabsContent>

            <TabsContent value="builder">
              <SurveyBuilder onSubmit={handleSurveySubmit} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}