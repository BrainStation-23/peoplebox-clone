import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SBUSelector } from "../components/AssignSurvey/SBUSelector";
import { UserSelector } from "../components/AssignSurvey/UserSelector";
import { RecurringSchedule } from "../components/AssignSurvey/RecurringSchedule";
import { DateRangePicker } from "../components/AssignSurvey/RecurringSchedule/DateRangePicker";
import { assignSurveySchema, type AssignSurveyFormData } from "../components/AssignSurvey/types";

export default function AssignSurveyPage() {
  const navigate = useNavigate();
  
  const form = useForm<AssignSurveyFormData>({
    resolver: zodResolver(assignSurveySchema),
    defaultValues: {
      assignmentType: "individual",
      isRecurring: false,
      recurringFrequency: "one_time",
    },
  });

  const { data: sbus } = useQuery({
    queryKey: ["sbus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sbus")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
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
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      // Set target_id based on assignment type according to the constraint
      const targetId = data.assignmentType === "individual" 
        ? data.targetId  // Use selected individual's ID
        : null;  // Must be null for organization and sbu

      // Create the main assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from("survey_assignments")
        .insert({
          survey_id: "your-survey-id", // TODO: Get this from URL params
          assignment_type: data.assignmentType,
          target_id: targetId,
          due_date: data.dueDate?.toISOString(),
          created_by: session.user.id,
          is_recurring: data.isRecurring,
          recurring_frequency: data.isRecurring ? data.recurringFrequency : null,
          recurring_ends_at: data.isRecurring ? data.recurringEndsAt?.toISOString() : null,
          recurring_days: data.isRecurring ? data.recurringDays : null,
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // If SBU type and targets selected, create assignment targets
      if (data.assignmentType === "sbu" && data.targetIds?.length) {
        const { error: targetsError } = await supabase
          .from("survey_assignment_targets")
          .insert(
            data.targetIds.map((targetId) => ({
              assignment_id: assignment.id,
              target_id: targetId,
            }))
          );

        if (targetsError) throw targetsError;
      }

      toast.success("Survey assigned successfully");
      navigate("/admin/surveys");
    } catch (error: any) {
      console.error("Error assigning survey:", error);
      toast.error("Failed to assign survey");
    }
  };

  const assignmentType = form.watch("assignmentType");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/surveys">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Assign Survey</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          <FormField
            control={form.control}
            name="assignmentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignment Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="sbu">SBU</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {assignmentType === "individual" && (
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
          )}

          {assignmentType === "sbu" && (
            <FormField
              control={form.control}
              name="targetIds"
              render={({ field }) => (
                <FormItem>
                  <SBUSelector
                    sbus={sbus || []}
                    selectedSBUs={field.value || []}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
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

          <Button type="submit" className="w-full">
            Assign Survey
          </Button>
        </form>
      </Form>
    </div>
  );
}