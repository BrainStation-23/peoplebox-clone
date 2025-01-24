import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { User } from "./types";
import { useUsers } from "./hooks/useUsers";
import { useUserActions } from "./hooks/useUserActions";
import UserTable from "./components/UserTable";
import CreateUserDialog from "./components/CreateUserDialog";
import EditUserDialog from "./components/EditUserDialog";
import { SearchFilters } from "./components/UserTable/SearchFilters";

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, refetch } = useUsers({
    currentPage,
    pageSize,
    searchTerm: debouncedSearch,
  });

  const { handleCreateSuccess, handleDelete } = useUserActions(refetch);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          onExport={() => {}} // Implement these handlers
          onImport={() => {}} // in the parent component
          sbus={[]} // Pass actual SBUs
          totalResults={data?.total}
          isSearching={isLoading}
        />

        <div className="relative">
          <UserTable
            users={data?.users || []}
            isLoading={isLoading}
            page={currentPage}
            pageSize={pageSize}
            total={data?.total || 0}
            onPageChange={handlePageChange}
            onDelete={handleDelete}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </div>

      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <EditUserDialog
        user={selectedUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}