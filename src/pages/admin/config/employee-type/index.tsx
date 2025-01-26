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
import { EmployeeTypeForm } from "./components/EmployeeTypeForm";
import { EmployeeTypeTable } from "./components/EmployeeTypeTable";

export default function EmployeeTypeConfig() {
  const [selectedType, setSelectedType] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employeeTypes, isLoading } = useQuery({
    queryKey: ['employee-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_types')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: { name: string }) => {
      const { data, error } = await supabase
        .from('employee_types')
        .insert([{ name: values.name }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-types'] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Employee type created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create employee type",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('employee_types')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-types'] });
      setIsDialogOpen(false);
      setSelectedType(null);
      toast({
        title: "Success",
        description: "Employee type updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update employee type",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-types'] });
      toast({
        title: "Success",
        description: "Employee type deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete employee type",
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: 'active' | 'inactive' }) => {
      const { data, error } = await supabase
        .from('employee_types')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-types'] });
      toast({
        title: "Success",
        description: "Employee type status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update employee type status",
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Employee Types</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedType ? "Edit Employee Type" : "Add Employee Type"}
              </DialogTitle>
            </DialogHeader>
            <EmployeeTypeForm
              onSubmit={handleSubmit}
              initialValues={selectedType}
              submitLabel={selectedType ? "Update Employee Type" : "Create Employee Type"}
            />
          </DialogContent>
        </Dialog>
      </div>

      <EmployeeTypeTable
        employeeTypes={employeeTypes || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}