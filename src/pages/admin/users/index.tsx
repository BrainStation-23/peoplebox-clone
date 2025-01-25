import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { User } from "./types";
import { useUsers } from "./hooks/useUsers";
import { useUserActions } from "./hooks/useUserActions";
import { useSBUs } from "./hooks/useSBUs";
import UserTable from "./components/UserTable";
import CreateUserDialog from "./components/CreateUserDialog";
import EditUserDialog from "./components/EditUserDialog";
import { SearchFilters } from "./components/UserTable/SearchFilters";
import { ImportDialog } from "./components/ImportDialog";
import { ExportProgress } from "./components/UserTable/ExportProgress";
import { exportUsers } from "./utils/exportUsers";

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSBU, setSelectedSBU] = useState("all");
  const [pageSize, setPageSize] = useState(10);
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
  }, [debouncedSearch, selectedSBU, pageSize]);

  const { data, isLoading, refetch } = useUsers({
    currentPage,
    pageSize,
    searchTerm: debouncedSearch,
    selectedSBU,
  });

  const { data: sbus = [] } = useSBUs();
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

      // Auto close after 2 seconds on success
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
          setSelectedSBU={setSelectedSBU}
          onExport={handleExport}
          onImport={() => setIsImportDialogOpen(true)}
          sbus={sbus}
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
            selectedSBU={selectedSBU}
            onPageSizeChange={handlePageSizeChange}
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

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={handleImportComplete}
      />

      <ExportProgress
        open={exportProgress.isOpen}
        onOpenChange={(open) =>
          setExportProgress((prev) => ({ ...prev, isOpen: open }))
        }
        progress={exportProgress.processed}
        total={exportProgress.total}
        error={exportProgress.error}
        isComplete={exportProgress.isComplete}
      />
    </div>
  );
}