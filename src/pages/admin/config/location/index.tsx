import { useState } from "react";
import { ArrowLeft, ExternalLink, MapPin, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LocationForm, LocationFormValues } from "./components/LocationForm";

type Location = {
  id: string;
  name: string;
  google_maps_url: string | null;
  address: string | null;
  created_at: string;
};

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Google Maps</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : locations?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No locations found
                </TableCell>
              </TableRow>
            ) : (
              locations?.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {location.name}
                    </div>
                  </TableCell>
                  <TableCell>{location.address || "—"}</TableCell>
                  <TableCell>
                    {location.google_maps_url ? (
                      <a
                        href={location.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:text-blue-700"
                      >
                        View on Maps
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog
                      open={editingLocation?.id === location.id}
                      onOpenChange={(open) => !open && setEditingLocation(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLocation(location)}
                        >
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Location</DialogTitle>
                          <DialogDescription>
                            Update the location details.
                          </DialogDescription>
                        </DialogHeader>
                        <LocationForm
                          initialValues={{
                            name: location.name,
                            google_maps_url: location.google_maps_url || "",
                            address: location.address || "",
                          }}
                          onSubmit={(values) =>
                            updateMutation.mutate({ id: location.id, ...values })
                          }
                          submitLabel="Save Changes"
                        />
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Location</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {location.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(location.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}