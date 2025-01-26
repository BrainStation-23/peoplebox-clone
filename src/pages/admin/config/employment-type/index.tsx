// ... Similar changes as employee-type/index.tsx, updating the query to include sorting
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { EmploymentTypeForm } from "./components/EmploymentTypeForm";
import { EmploymentTypeTable } from "./components/EmploymentTypeTable";

export default function EmploymentTypeConfig() {
  const [selectedType, setSelectedType] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employmentTypes, isLoading } = useQuery({
    queryKey: ['employment-types', sortOrder],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employment_types')
        .select('*')
        .order('name', { ascending: sortOrder === 'asc' });
      
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: { name: string }) => {
      const { data, error } = await supabase
        .from('employment_types')
        .insert([{ name: values.name }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-types'] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Employment type created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create employment type",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('employment_types')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-types'] });
      setIsDialogOpen(false);
      setSelectedType(null);
      toast({
        title: "Success",
        description: "Employment type updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update employment type",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employment_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-types'] });
      toast({
        title: "Success",
        description: "Employment type deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete employment type",
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: 'active' | 'inactive' }) => {
      const { data, error } = await supabase
        .from('employment_types')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-types'] });
      toast({
        title: "Success",
        description: "Employment type status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update employment type status",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: { name: string }) => {
    if (selectedType) {
      updateMutation.mutate({ id: selectedType.id, name: values.name });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (type: any) => {
    setSelectedType(type);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleToggleStatus = (id: string, newStatus: 'active' | 'inactive') => {
    toggleStatusMutation.mutate({ id, newStatus });
  };

  const handleSort = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Employment Types</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employment Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedType ? "Edit Employment Type" : "Add Employment Type"}
              </DialogTitle>
            </DialogHeader>
            <EmploymentTypeForm
              onSubmit={handleSubmit}
              initialValues={selectedType}
              submitLabel={selectedType ? "Update Employment Type" : "Create Employment Type"}
            />
          </DialogContent>
        </Dialog>
      </div>

      <EmploymentTypeTable
        employmentTypes={employmentTypes || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </div>
  );
}
