import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SBUForm, type SBUFormValues } from "./components/SBUForm";
import { SBUTable } from "./components/SBUTable";

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

  // Create SBU mutation
  const createSBU = useMutation({
    mutationFn: async (values: SBUFormValues) => {
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
            <SBUForm
              onSubmit={createSBU.mutate}
              profiles={profiles}
            />
          </DialogContent>
        </Dialog>
      </div>

      <SBUTable
        sbus={sbus || []}
        onEdit={setEditingSBU}
        onDelete={deleteSBU.mutate}
        isLoading={isLoadingSBUs}
      />

      <Dialog open={!!editingSBU} onOpenChange={(open) => !open && setEditingSBU(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit SBU</DialogTitle>
          </DialogHeader>
          <SBUForm
            onSubmit={(values) => updateSBU.mutate({ ...values, id: editingSBU.id })}
            profiles={profiles}
            initialValues={{
              name: editingSBU?.name || "",
              profile_image_url: editingSBU?.profile_image_url || "",
              website: editingSBU?.website || "",
              head_id: editingSBU?.head_id,
            }}
            submitLabel="Update SBU"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}