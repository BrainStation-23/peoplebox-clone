<lov-code>
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { User } from "./types";
import { useUsers } from "./hooks/useUsers";
import { useUserActions } from "./hooks/useUserActions";
import { useSBUs } from "./hooks/useSBUs";
import { useFilterOptions } from "./hooks/useFilterOptions";
import { UserGrid } from "./components/UserGrid";
import CreateUserDialog from "./components/CreateUserDialog";
import EditUserDialog from "./components/EditUserDialog";
import { SearchFilters } from "./components/UserTable/SearchFilters";
import { ImportDialog } from "./components/ImportDialog";
import { ExportProgress } from "./components/UserTable/ExportProgress";
import { exportUsers } from "./utils/exportUsers";
import { Button } from "@/components/ui/button";
import { Power, MoreHorizontal, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSBU, setSelectedSBU] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("all");
  const [selectedEmployeeRole, setSelectedEmployeeRole] = useState("all");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [exportProgress, setExportProgress] = useState({
    isOpen: false,
    processed: 0,
    total: 0,
    error: "",
    isComplete: false,
  });
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedSBU, selectedLevel, selectedLocation, 
      selectedEmploymentType, selectedEmployeeRole, selectedEmployeeType, pageSize]);

  const { data, isLoading, refetch } = useUsers({
    currentPage,
    pageSize,
    searchTerm: debouncedSearch,
    selectedSBU,
    selectedLevel,
    selectedLocation,
    selectedEmploymentType,
    selectedEmployeeRole,
    selectedEmployeeType
  });

  const { data: sbus = [] } = useSBUs();
  const { 
    levels,
    locations,
    employmentTypes,
    employeeRoles,
    employeeTypes,
    isLoading: isLoadingFilters
  } = useFilterOptions();
  const { handleCreateSuccess, handleDelete } = useUserActions(refetch);

  const handleExport = async () => {
    if (!data?.users) return;
    
    setExportProgress({
      isOpen: true,
      processed: 0,
      total: data.users.length,
      error: "",
      isComplete: false,
    });

    try {
      await exportUsers(data.users, (processed) => {
        setExportProgress(prev => ({
          ...prev,
          processed,
        }));
      });

      setExportProgress(prev => ({
        ...prev,
        isComplete: true,
      }));

      setTimeout(() => {
        setExportProgress(prev => ({
          ...prev,
          isOpen: false,
        }));
      }, 2000);
    } catch (error) {
      setExportProgress(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to export users",
      }));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };

  const handleImportComplete = () => {
    refetch();
    setIsImportDialogOpen(false);
  };

  const handleBulkDelete = async () => {
    try {
      for (const userId of selectedUsers) {
        await handleDelete(userId);
      }
      toast.success(`Successfully deleted ${selectedUsers.length} users`);
      setSelectedUsers([]);
    } catch (error) {
      toast.error("Failed to delete selected users");
    }
  };

  const handleBulkStatusToggle = async () => {
    try {
      const { data: firstUser } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', selectedUsers[0])
        .single();

      const newStatus = firstUser?.status === 'active' ? 'disabled' : 'active';

      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .in('id', selectedUsers);

      if (error) throw error;

      refetch();
      
      toast.success(
        `Successfully ${newStatus === 'active' ? 'activated' : 'deactivated'} ${selectedUsers.length} users`
      );
      
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error("Failed to update user status");
    }
  };

  const handleRoleToggle = async (userId: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: isAdmin ? 'admin' : 'user' })
        .eq('user_id', userId);

      if (error) throw error;

      refetch();
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: isActive ? 'active' : 'disabled' })
        .eq('id', userId);

      if (error) throw error;

      refetch();
      toast.success('User status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
        >
          Add User
        </button>
      </div>

      <div className="space-y-4">
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedSBU={selectedSBU}
          selectedLevel={selectedLevel}
          selectedLocation={selectedLocation}
          selectedEmploymentType={selectedEmploymentType}
          selectedEmployeeRole={selectedEmployeeRole}
          selectedEmployeeType={selectedEmployeeType}
          setSelectedSBU={setSelectedSBU}
          setSelectedLevel={setSelectedLevel}
          setSelectedLocation={setSelectedLocation}
          setSelectedEmploymentType={setSelectedEmploymentType}
          setSelectedEmployeeRole={setSelectedEmployeeRole}
          setSelectedEmployeeType={setSelectedEmployeeType}
          onExport={handleExport}
          onImport={() => setIsImportDialogOpen(true)}
          sbus={sbus}
          levels={levels}
          locations={locations}
          employmentTypes={employmentTypes}
          employeeRoles={employeeRoles}
          employeeTypes={employeeTypes}
          totalResults={data?.total}
          isSearching={isLoading || isLoadingFilters}
        />

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {selectedUsers.length > 0 && (
             