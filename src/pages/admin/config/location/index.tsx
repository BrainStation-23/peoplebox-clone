import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LocationForm } from "./components/LocationForm";
import { LocationTable } from "./components/LocationTable";
import type { Location, LocationFormValues } from "./types";

export default function LocationConfig() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const { data: locations, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Location[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: LocationFormValues) => {
      const { error } = await supabase.from("locations").insert({
        name: values.name,
        google_maps_url: values.google_maps_url || null,
        address: values.address || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setIsCreateOpen(false);
      toast.success("Location created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create location");
      console.error("Error creating location:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...values }: { id: string } & LocationFormValues) => {
      const { error } = await supabase
        .from("locations")
        .update({
          name: values.name,
          google_maps_url: values.google_maps_url || null,
          address: values.address || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setEditingLocation(null);
      toast.success("Location updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update location");
      console.error("Error updating location:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("locations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Location deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete location");
      console.error("Error deleting location:", error);
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Location Configuration</h1>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Location</DialogTitle>
              <DialogDescription>
                Add a new location to the system.
              </DialogDescription>
            </DialogHeader>
            <LocationForm onSubmit={createMutation.mutate} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <LocationTable
          locations={locations}
          isLoading={isLoading}
          onEdit={setEditingLocation}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      </div>

      <Dialog open={!!editingLocation} onOpenChange={(open) => !open && setEditingLocation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>
              Update the location details.
            </DialogDescription>
          </DialogHeader>
          {editingLocation && (
            <LocationForm
              initialValues={{
                name: editingLocation.name,
                google_maps_url: editingLocation.google_maps_url || "",
                address: editingLocation.address || "",
              }}
              onSubmit={(values) =>
                updateMutation.mutate({ id: editingLocation.id, ...values })
              }
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}