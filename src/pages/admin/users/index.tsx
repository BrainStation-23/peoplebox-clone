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
import { BulkUpdateDialog } from "./components/BulkUpdateDialog";
import { Button } from "@/components/ui/button";
import { Power, MoreHorizontal, Upload, UserRoundPlus, FilePlus2, FileSpreadsheet, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { exportAllUsers } from "./utils/exportUsers";

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
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

  const handleExportAll = async () => {
    try {
      toast.info("Starting export of all users...");
      await exportAllUsers((processed) => {
        console.log(`Processed ${processed} users`);
      });
      toast.success("Successfully exported all users");
    } catch (error) {
      console.error("Error exporting all users:", error);
      toast.error("Failed to export all users");
    }
  };

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <UserRoundPlus className="mr-2 h-4 w-4"/>
            Add User
          </Button>
          <Button onClick={() => setIsImportDialogOpen(true)} variant="outline">
            <FilePlus2 className="mr-2 h-4 w-4"/>
            Bulk Create Users
          </Button>
          <Button onClick={() => setIsUpdateDialogOpen(true)} variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Bulk Update Users
          </Button>
          <Button onClick={handleExportAll} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
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
          sbus={sbus}
          levels={levels}
          locations={locations}
          employmentTypes={employmentTypes}
          employeeRoles={employeeRoles}
          employeeTypes={employeeTypes}
          totalResults={data?.total}
          isSearching={isLoading || isLoadingFilters}
          onBulkCreate={() => setIsImportDialogOpen(true)}
        />

        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions <MoreHorizontal className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleBulkStatusToggle}>
                  <Power className="mr-2 h-4 w-4" />
                  Toggle Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-sm text-muted-foreground">
              {selectedUsers.length} selected
            </span>
          </div>
        )}

        <UserGrid
          users={data?.users || []}
          selectedUsers={selectedUsers}
          onSelectUser={(userId, checked) => {
            if (checked) {
              setSelectedUsers(prev => [...prev, userId]);
            } else {
              setSelectedUsers(prev => prev.filter(id => id !== userId));
            }
          }}
          onEdit={setSelectedUser}
          onDelete={handleDelete}
          onPasswordChange={() => {}}
          onRoleToggle={() => {}}
          onStatusToggle={() => {}}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      </div>

      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <EditUserDialog
        user={selectedUser}
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      />

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={() => {
          refetch();
          setIsImportDialogOpen(false);
        }}
      />

      <BulkUpdateDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        onUpdateComplete={() => {
          refetch();
          setIsUpdateDialogOpen(false);
        }}
      />
    </div>
  );
}
