import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CampaignForm } from "./components/CampaignForm";

export default function CampaignFormPage() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('survey_campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isEditMode,
  });

  const { data: surveys } = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('surveys')
        .select('id, name')
        .eq('status', 'published')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (formData: any) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to create a campaign",
        });
        navigate('/login');
        return;
      }

      if (isEditMode) {
        const { error } = await supabase
          .from('survey_campaigns')
          .update(formData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Campaign updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('survey_campaigns')
          .insert({
            ...formData,
            created_by: session.user.id,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Campaign created successfully",
        });
      }
      
      navigate("/admin/surveys/campaigns");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} campaign`,
      });
    }
  };

  if (isEditMode && isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Edit' : 'Create'} Campaign
      </h1>
      
      <CampaignForm 
        onSubmit={handleSubmit}
        surveys={surveys || []}
        defaultValues={campaign}
      />
    </div>
  );
}