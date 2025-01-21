import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const surveyFormSchema = z.object({
  name: z.string().min(1, "Survey name is required"),
  description: z.string().optional(),
  tags: z.array(z.string()),
  json_data: z.any(), // We'll add proper validation in the next iteration
});

type FormData = z.infer<typeof surveyFormSchema>;

export default function CreateSurveyPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState("basic-info");
  
  const form = useForm<FormData>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      name: "",
      description: "",
      tags: [],
      json_data: {},
    },
  });

  const handleAddTag = () => {
    if (newTag.trim() && !form.getValues("tags").includes(newTag.trim())) {
      form.setValue("tags", [...form.getValues("tags"), newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue(
      "tags",
      form.getValues("tags").filter((tag) => tag !== tagToRemove)
    );
  };

  const onSubmit = async (data: FormData) => {
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
        name: data.name,
        description: data.description,
        tags: data.tags,
        json_data: data.json_data,
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
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <TabsContent value="basic-info" className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Survey Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter survey name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter survey description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Tags</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch("tags").map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="builder" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium">Survey Builder</h3>
                        <p className="text-sm text-muted-foreground">
                          Design your survey using Survey.js Creator
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <a
                          href="https://surveyjs.io/create-survey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          Open Survey.js Creator
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    <FormField
                      control={form.control}
                      name="json_data"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Survey JSON</FormLabel>
                          <FormDescription>
                            Paste your Survey.js JSON configuration here
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Paste your Survey.js JSON here"
                              className="font-mono min-h-[300px]"
                              {...field}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(e.target.value);
                                  field.onChange(parsed);
                                } catch (error) {
                                  // We'll handle JSON validation in the next iteration
                                  field.onChange(e.target.value);
                                }
                              }}
                              value={
                                typeof field.value === "object"
                                  ? JSON.stringify(field.value, null, 2)
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/surveys")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Survey</Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}