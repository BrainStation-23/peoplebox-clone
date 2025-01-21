import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserSelector } from "../components/AssignSurvey/UserSelector";
import { RecurringSchedule } from "../components/AssignSurvey/RecurringSchedule";
import { DateRangePicker } from "../components/AssignSurvey/RecurringSchedule/DateRangePicker";
import { SBUSelector } from "../components/AssignSurvey/SBUSelector";
import { assignSurveySchema, type AssignSurveyFormData } from "../components/AssignSurvey/types";

export default function AssignSurveyPage() {
  const navigate = useNavigate();
  const { id: surveyId } = useParams();
  
  // Fetch survey details
  const { data: survey, isLoading: surveyLoading } = useQuery({
    queryKey: ["survey", surveyId],
    queryFn: async () => {
      if (!surveyId) throw new Error("No survey ID provided");
      const { data, error } = await supabase
        .from("surveys")
        .select("name")
        .eq("id", surveyId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!surveyId,
  });
  
  const form = useForm<AssignSurveyFormData>({
    resolver: zodResolver(assignSurveySchema),
    defaultValues: {
      isRecurring: false,
      recurringFrequency: "one_time",
      isOrganizationWide: false,
      selectedSBUs: [],
    },
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: sbus } = useQuery({
    queryKey: ["sbus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sbus")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  });

  const onSubmit = async (data: AssignSurveyFormData) => {
    try {
      if (!surveyId) {
        throw new Error("No survey ID provided");
      }

      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      // Create the survey assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from("survey_assignments")
        .insert({
          survey_id: surveyId,
          user_id: data.targetId,
          due_date: data.dueDate?.toISOString(),
          created_by: session.user.id,
          is_recurring: data.isRecurring,
          recurring_frequency: data.isRecurring ? data.recurringFrequency : null,
          recurring_ends_at: data.isRecurring ? data.recurringEndsAt?.toISOString() : null,
          recurring_days: data.isRecurring ? data.recurringDays : null,
          is_organization_wide: data.isOrganizationWide,
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // If SBUs are selected, create SBU assignments
      if (data.selectedSBUs.length > 0) {
        const sbuAssignments = data.selectedSBUs.map(sbuId => ({
          assignment_id: assignment.id,
          sbu_id: sbuId,
        }));

        const { error: sbuError } = await supabase
          .from("survey_sbu_assignments")
          .insert(sbuAssignments);

        if (sbuError) throw sbuError;
      }

      toast.success("Survey assigned successfully");
      navigate("/admin/surveys");
    } catch (error: any) {
      console.error("Error assigning survey:", error);
      toast.error("Failed to assign survey");
    }
  };

  if (!surveyId) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No survey ID provided. Please select a survey to assign.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => navigate("/admin/surveys")}
          className="mt-4"
        >
          Back to Surveys
        </Button>
      </div>
    );
  }

  const isOrganizationWide = form.watch("isOrganizationWide");

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">
        Assign Survey: {surveyLoading ? 'Loading...' : survey?.name}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="isOrganizationWide"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Organization-wide</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {!isOrganizationWide && (
                <>
                  <FormField
                    control={form.control}
                    name="targetId"
                    render={({ field }) => (
                      <FormItem>
                        <UserSelector
                          users={users || []}
                          selectedUserId={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="selectedSBUs"
                    render={({ field }) => (
                      <FormItem>
                        <SBUSelector
                          sbus={sbus || []}
                          selectedSBUs={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <DateRangePicker
                      date={field.value}
                      onDateChange={field.onChange}
                      label="Due Date"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem>
                    <RecurringSchedule
                      isRecurring={field.value}
                      frequency={form.watch("recurringFrequency") || "one_time"}
                      endsAt={form.watch("recurringEndsAt")}
                      onIsRecurringChange={field.onChange}
                      onFrequencyChange={(value) => form.setValue("recurringFrequency", value as any)}
                      onEndsAtChange={(date) => form.setValue("recurringEndsAt", date)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate("/admin/surveys")}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Assign Survey
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}