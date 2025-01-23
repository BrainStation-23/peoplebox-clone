import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function EmailConfig() {
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const queryClient = useQueryClient();

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

  const updateConfig = useMutation({
    mutationFn: async (values: { from_email: string; from_name: string }) => {
      const configData = {
        provider: "resend" as const,
        from_email: values.from_email,
        from_name: values.from_name,
      };

      const { error } = await supabase
        .from("email_config")
        .upsert({
          ...configData,
          provider_settings: {},
          is_singleton: true,
        });

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

  const testEmail = async () => {
    setIsTestingEmail(true);
    try {
      const { error } = await supabase.functions.invoke("test-email-config", {
        body: {
          from_email: emailConfig?.from_email,
          from_name: emailConfig?.from_name,
        },
      });

      if (error) throw error;
      toast.success("Test email sent successfully");
    } catch (error) {
      console.error("Test email error:", error);
      toast.error("Failed to send test email");
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateConfig.mutate({
      from_email: formData.get("from_email") as string,
      from_name: formData.get("from_name") as string,
    });
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_email">From Email</Label>
                <Input
                  id="from_email"
                  name="from_email"
                  type="email"
                  defaultValue={emailConfig?.from_email}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="from_name">From Name</Label>
                <Input
                  id="from_name"
                  name="from_name"
                  defaultValue={emailConfig?.from_name}
                  required
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={testEmail}
                disabled={isTestingEmail || !emailConfig?.from_email}
              >
                {isTestingEmail ? "Testing..." : "Test Email"}
              </Button>
              <Button type="submit" disabled={updateConfig.isPending}>
                {updateConfig.isPending ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}