import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Pencil, Trash2, ExternalLink, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Schema for SBU form validation
const sbuFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  profile_image_url: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  head_id: z.string().uuid().optional(),
});

type SBUFormValues = z.infer<typeof sbuFormSchema>;

export default function SBUsConfig() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSBU, setEditingSBU] = useState<any>(null);

  // Fetch SBUs
  const { data: sbus, isLoading: isLoadingSBUs } = useQuery({
    queryKey: ["sbus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sbus")
        .select(`
          *,
          head:profiles(
            id,
            first_name,
            last_name,
            email
          )
        `);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch profiles for head selection
  const { data: profiles, isLoading: isLoadingProfiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email");
      
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<SBUFormValues>({
    resolver: zodResolver(sbuFormSchema),
    defaultValues: {
      name: "",
      profile_image_url: "",
      website: "",
      head_id: undefined,
    },
  });

  // Create SBU mutation
  const createSBU = useMutation({
    mutationFn: async (values: SBUFormValues) => {
      // Ensure name is provided as it's required by the schema
      if (!values.name) {
        throw new Error("Name is required");
      }
      
      const { error } = await supabase.from("sbus").insert({
        name: values.name,
        profile_image_url: values.profile_image_url || null,
        website: values.website || null,
        head_id: values.head_id || null,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sbus"] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "SBU created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating SBU",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update SBU mutation
  const updateSBU = useMutation({
    mutationFn: async ({ id, ...values }: SBUFormValues & { id: string }) => {
      // Ensure name is provided as it's required by the schema
      if (!values.name) {
        throw new Error("Name is required");
      }
      
      const { error } = await supabase
        .from("sbus")
        .update({
          name: values.name,
          profile_image_url: values.profile_image_url || null,
          website: values.website || null,
          head_id: values.head_id || null,
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sbus"] });
      setEditingSBU(null);
      form.reset();
      toast({
        title: "SBU updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating SBU",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete SBU mutation
  const deleteSBU = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sbus").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sbus"] });
      toast({
        title: "SBU deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting SBU",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: SBUFormValues) => {
    if (editingSBU) {
      updateSBU.mutate({ ...values, id: editingSBU.id });
    } else {
      createSBU.mutate(values);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Strategic Business Units</h1>
      </div>

      <div className="mb-4">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add SBU
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New SBU</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profile_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="head_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SBU Head</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a head" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {profiles?.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.first_name} {profile.last_name} ({profile.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Create SBU
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Head</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sbus?.map((sbu) => (
              <TableRow key={sbu.id}>
                <TableCell>{sbu.name}</TableCell>
                <TableCell>
                  {sbu.head ? (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {sbu.head.first_name} {sbu.head.last_name}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No head assigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {sbu.website ? (
                    <a
                      href={sbu.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-500 hover:text-blue-700"
                    >
                      Visit website
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">No website</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingSBU(sbu);
                        form.reset({
                          name: sbu.name,
                          profile_image_url: sbu.profile_image_url || "",
                          website: sbu.website || "",
                          head_id: sbu.head_id,
                        });
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this SBU?")) {
                          deleteSBU.mutate(sbu.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoadingSBUs && (!sbus || sbus.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No SBUs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingSBU} onOpenChange={(open) => !open && setEditingSBU(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit SBU</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profile_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="head_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SBU Head</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a head" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {profiles?.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.first_name} {profile.last_name} ({profile.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Update SBU
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}