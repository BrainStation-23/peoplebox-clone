import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { User } from "../types";
import EditUserDialog from "./EditUserDialog";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onDelete: (userId: string) => void;
}

export default function UserTable({
  users,
  total,
  page,
  pageSize,
  isLoading,
  onPageChange,
  onDelete,
}: UserTableProps) {
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const totalPages = Math.ceil(total / pageSize);

  const handleDelete = async () => {
    if (userToDelete) {
      await onDelete(userToDelete);
      setUserToDelete(null);
    }
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <Button
            variant={page === i ? "default" : "ghost"}
            onClick={() => onPageChange(i)}
            className="w-10"
          >
            {i}
          </Button>
        </PaginationItem>
      );
    }

    return items;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                {user.first_name || user.last_name
                  ? `${user.first_name || ""} ${user.last_name || ""}`
                  : "N/A"}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.user_roles.role === "admin" ? "default" : "secondary"}>
                  {user.user_roles.role}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUserToEdit(user)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog open={userToDelete === user.id} onOpenChange={(open) => !open && setUserToDelete(null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setUserToDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this user? This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditUserDialog
        user={userToEdit}
        open={!!userToEdit}
        onOpenChange={(open) => !open && setUserToEdit(null)}
      />

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="ghost"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="cursor-pointer"
            >
              <PaginationPrevious />
            </Button>
          </PaginationItem>
          {renderPaginationItems()}
          <PaginationItem>
            <Button
              variant="ghost"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="cursor-pointer"
            >
              <PaginationNext />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}