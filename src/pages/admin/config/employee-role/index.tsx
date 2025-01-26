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
import { EmployeeRoleForm } from "./components/EmployeeRoleForm";
import { EmployeeRoleTable } from "./components/EmployeeRoleTable";

export default function EmployeeRoleConfig() {
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employeeRoles, isLoading } = useQuery({
    queryKey: ['employee-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_roles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: { name: string }) => {
      const { data, error } = await supabase
        .from('employee_roles')
        .insert([{ name: values.name }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-roles'] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Employee role created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create employee role",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('employee_roles')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-roles'] });
      setIsDialogOpen(false);
      setSelectedRole(null);
      toast({
        title: "Success",
        description: "Employee role updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update employee role",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_roles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-roles'] });
      toast({
        title: "Success",
        description: "Employee role deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete employee role",
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: 'active' | 'inactive' }) => {
      const { data, error } = await supabase
        .from('employee_roles')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-roles'] });
      toast({
        title: "Success",
        description: "Employee role status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update employee role status",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: { name: string }) => {
    if (selectedRole) {
      updateMutation.mutate({ id: selectedRole.id, name: values.name });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (role: any) => {
    setSelectedRole(role);
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
        <h2 className="text-3xl font-bold tracking-tight">Employee Roles</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedRole ? "Edit Employee Role" : "Add Employee Role"}
              </DialogTitle>
            </DialogHeader>
            <EmployeeRoleForm
              onSubmit={handleSubmit}
              initialValues={selectedRole}
              submitLabel={selectedRole ? "Update Employee Role" : "Create Employee Role"}
            />
          </DialogContent>
        </Dialog>
      </div>

      <EmployeeRoleTable
        employeeRoles={employeeRoles || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}