import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  from_email: z.string().email("Invalid email address"),
  from_name: z.string().min(1, "From name is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function EmailConfig() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from_email: "",
      from_name: "",
    },
  });

  const { data: emailConfig, isLoading } = useQuery({
    queryKey: ["email-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_config")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (emailConfig) {
      form.reset({
        from_email: emailConfig.from_email,
        from_name: emailConfig.from_name,
      });
    }
  }, [emailConfig, form]);

  const updateConfig = useMutation({
    mutationFn: async (values: FormValues) => {
      const configData = {
        ...values,
        provider: "resend" as const,
      };

      const { error } = await supabase
        .from("email_config")
        .upsert(configData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-config"] });
      toast.success("Email configuration updated successfully");
    },
    onError: (error) => {
      console.error("Error updating email config:", error);
      toast.error("Failed to update email configuration");
    },
  });

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const values = form.getValues();
      const { error } = await supabase.functions.invoke("test-email-config", {
        body: values,
      });

      if (error) throw error;
      toast.success("Email test successful");
    } catch (error) {
      console.error("Email test error:", error);
      toast.error("Email test failed");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const onSubmit = (values: FormValues) => {
    updateConfig.mutate(values);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Email Configuration</h1>

      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
          <CardDescription>
            Configure your email settings for sending notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="from_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="from_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={testConnection}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? "Testing..." : "Test Email"}
                </Button>
                <Button type="submit" disabled={updateConfig.isPending}>
                  {updateConfig.isPending ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}