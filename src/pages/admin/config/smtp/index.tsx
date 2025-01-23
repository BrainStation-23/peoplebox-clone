import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  host: z.string().min(1, "Host is required"),
  port: z.coerce.number().min(1, "Port is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  from_email: z.string().email("Invalid email address"),
  from_name: z.string().min(1, "From name is required"),
  use_ssl: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function SMTPConfig() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      host: "",
      port: 587,
      username: "",
      password: "",
      from_email: "",
      from_name: "",
      use_ssl: true,
    },
  });

  const { data: smtpConfig, isLoading } = useQuery({
    queryKey: ["smtp-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("smtp_config")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Use useEffect to set form values when data loads
  useEffect(() => {
    if (smtpConfig) {
      form.reset(smtpConfig);
    }
  }, [smtpConfig, form]);

  const updateConfig = useMutation({
    mutationFn: async (values: FormValues) => {
      // Ensure all required fields are present
      const configData = {
        host: values.host,
        port: values.port,
        username: values.username,
        password: values.password,
        from_email: values.from_email,
        from_name: values.from_name,
        use_ssl: values.use_ssl,
      };

      const { error } = await supabase
        .from("smtp_config")
        .upsert(configData, { onConflict: "id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smtp-config"] });
      toast.success("SMTP configuration updated successfully");
    },
    onError: (error) => {
      console.error("Error updating SMTP config:", error);
      toast.error("Failed to update SMTP configuration");
    },
  });

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const values = form.getValues();
      const { error } = await supabase.functions.invoke("test-smtp", {
        body: values,
      });

      if (error) throw error;
      toast.success("SMTP connection test successful");
    } catch (error) {
      console.error("SMTP test error:", error);
      toast.error("SMTP connection test failed");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const onSubmit = (values: FormValues) => {
    updateConfig.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">SMTP Configuration</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Server Settings</CardTitle>
          <CardDescription>
            Configure your SMTP server settings for sending emails.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Host</FormLabel>
                      <FormControl>
                        <Input placeholder="smtp.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

              <FormField
                control={form.control}
                name="use_ssl"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Use SSL/TLS</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={testConnection}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? "Testing..." : "Test Connection"}
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