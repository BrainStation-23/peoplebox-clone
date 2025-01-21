import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Filter } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DateRangePicker } from "../components/AssignSurvey/RecurringSchedule/DateRangePicker";
import { RecurringSchedule } from "../components/AssignSurvey/RecurringSchedule";
import { assignSurveySchema, type AssignSurveyFormData } from "../components/AssignSurvey/types";

export default function AssignSurveyPage() {
  const navigate = useNavigate();
  const { id: surveyId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSBUFilter, setSelectedSBUFilter] = useState("all");
  
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
      selectedSBUs: [],
    },
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, user_sbus!inner(sbu:sbus(id, name), is_primary)")
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

  const filteredUsers = users?.filter(user => {
    const matchesSearch = searchTerm === "" || 
      `${user.first_name || ''} ${user.last_name || ''} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSBU = selectedSBUFilter === "all" || 
      user.user_sbus?.some(sbu => sbu.sbu.id === selectedSBUFilter);

    return matchesSearch && matchesSBU;
  });

  const onSubmit = async (data: AssignSurveyFormData) => {
    try {
      if (!surveyId) throw new Error("No survey ID provided");
      if (!session?.user?.id) throw new Error("No authenticated user found");

      const { error: assignmentError } = await supabase
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
        });

      if (assignmentError) throw assignmentError;

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
        <Button onClick={() => navigate("/admin/surveys")} className="mt-4">
          Back to Surveys
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Select value={selectedSBUFilter} onValueChange={setSelectedSBUFilter}>
                      <SelectTrigger className="w-[200px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by SBU" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All SBUs</SelectItem>
                        {sbus?.map((sbu) => (
                          <SelectItem key={sbu.id} value={sbu.id}>
                            {sbu.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <FormField
                    control={form.control}
                    name="targetId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select User</FormLabel>
                        <FormControl>
                          <ScrollArea className="h-[300px] border rounded-md p-2">
                            <div className="space-y-1">
                              {filteredUsers?.map((user) => {
                                const isSelected = field.value === user.id;
                                const displayName = `${user.first_name || ''} ${user.last_name || ''} ${!user.first_name && !user.last_name ? user.email : ''}`.trim();
                                
                                return (
                                  <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => field.onChange(user.id)}
                                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-sm text-sm hover:bg-accent hover:text-accent-foreground ${
                                      isSelected ? 'bg-accent' : ''
                                    }`}
                                  >
                                    <span>{displayName}</span>
                                    {isSelected && <Check className="h-4 w-4" />}
                                  </button>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
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
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
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