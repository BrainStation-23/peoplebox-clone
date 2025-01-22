import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CampaignForm, CampaignFormData } from "./components/CampaignForm";
import type { Database } from "@/integrations/supabase/types";

type Campaign = Database['public']['Tables']['survey_campaigns']['Row'];
type CampaignInsert = Database['public']['Tables']['survey_campaigns']['Insert'];

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

      if (data) {
        return {
          ...data,
          starts_at: new Date(data.starts_at),
          recurring_ends_at: data.recurring_ends_at ? new Date(data.recurring_ends_at) : undefined,
          ends_at: data.ends_at ? new Date(data.ends_at) : undefined,
        };
      }
      return null;
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

  const handleSubmit = async (formData: CampaignFormData) => {
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

      const dataToSubmit: CampaignInsert = {
        name: formData.name,
        description: formData.description,
        survey_id: formData.survey_id,
        starts_at: formData.starts_at.toISOString(),
        is_recurring: formData.is_recurring,
        recurring_frequency: formData.recurring_frequency,
        recurring_ends_at: formData.recurring_ends_at?.toISOString(),
        instance_duration_days: formData.instance_duration_days,
        instance_end_time: formData.instance_end_time || '23:59:59',
        ends_at: formData.ends_at?.toISOString(),
        status: formData.status,
        created_by: session.user.id,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('survey_campaigns')
          .update(dataToSubmit)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Campaign updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('survey_campaigns')
          .insert(dataToSubmit);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Campaign created successfully",
        });
      }
      
      navigate("/admin/surveys/campaigns");
    } catch (error: any) {
      console.error('Campaign submission error:', error);
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