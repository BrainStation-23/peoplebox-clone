import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserSelector } from "./UserSelector";
import { RecurringSchedule } from "./RecurringSchedule";
import { DateRangePicker } from "./RecurringSchedule/DateRangePicker";
import { assignSurveySchema, type AssignSurveyFormData } from "./types";

interface AssignSurveyProps {
  surveyId: string;
  campaignId?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
  onAssigned?: () => void;
}

export function AssignSurveyDialog({ 
  surveyId, 
  campaignId,
  isRecurring,
  recurringFrequency,
  onAssigned 
}: AssignSurveyProps) {
  const [open, setOpen] = useState(false);
  
  const form = useForm<AssignSurveyFormData>({
    resolver: zodResolver(assignSurveySchema),
    defaultValues: {
      selectedUsers: [],
      isRecurring: false,
      recurringFrequency: "one_time",
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

      if (!surveyId) {
        throw new Error("No survey ID provided");
      }

      if (data.selectedUsers.length === 0) {
        toast.error("Please select at least one user");
        return;
      }

      const assignments = data.selectedUsers.map(userId => ({
        survey_id: surveyId,
        user_id: userId,
        due_date: data.dueDate?.toISOString(),
        created_by: session.user.id,
        is_recurring: data.isRecurring,
        recurring_frequency: data.isRecurring ? data.recurringFrequency : null,
        recurring_ends_at: data.isRecurring ? data.recurringEndsAt?.toISOString() : null,
        recurring_days: data.isRecurring ? data.recurringDays : null,
      }));

      const { error: assignmentError } = await supabase
        .from("survey_assignments")
        .insert(assignments);

      if (assignmentError) throw assignmentError;

      toast.success("Survey assigned successfully");
      setOpen(false);
      onAssigned?.();
    } catch (error: any) {
      console.error("Error assigning survey:", error);
      toast.error("Failed to assign survey");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Assign Survey
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Survey</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="selectedUsers"
              render={({ field }) => (
                <FormItem>
                  <UserSelector
                    users={users || []}
                    selectedUsers={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

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
      </DialogContent>
    </Dialog>
  );
}

// Export the component without Dialog wrapper for campaign usage
export function AssignSurvey({ 
  surveyId, 
  campaignId,
  isRecurring,
  recurringFrequency,
  onAssigned 
}: AssignSurveyProps) {
  const form = useForm<AssignSurveyFormData>({
    resolver: zodResolver(assignSurveySchema),
    defaultValues: {
      selectedUsers: [],
      isRecurring: isRecurring || false,
      recurringFrequency: recurringFrequency || "one_time",
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

      if (!surveyId) {
        throw new Error("No survey ID provided");
      }

      if (data.selectedUsers.length === 0) {
        toast.error("Please select at least one user");
        return;
      }

      const assignments = data.selectedUsers.map(userId => ({
        survey_id: surveyId,
        user_id: userId,
        due_date: data.dueDate?.toISOString(),
        created_by: session.user.id,
        campaign_id: campaignId,
        is_recurring: data.isRecurring,
        recurring_frequency: data.isRecurring ? data.recurringFrequency : null,
        recurring_ends_at: data.isRecurring ? data.recurringEndsAt?.toISOString() : null,
        recurring_days: data.isRecurring ? data.recurringDays : null,
      }));

      const { error: assignmentError } = await supabase
        .from("survey_assignments")
        .insert(assignments);

      if (assignmentError) throw assignmentError;

      toast.success("Survey assigned successfully");
      onAssigned?.();
      form.reset();
    } catch (error: any) {
      console.error("Error assigning survey:", error);
      toast.error("Failed to assign survey");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="selectedUsers"
          render={({ field }) => (
            <FormItem>
              <UserSelector
                users={users || []}
                selectedUsers={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

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
                onFrequencyChange={(value) => form.setValue("recurringFrequency", value)}
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
  );
}
