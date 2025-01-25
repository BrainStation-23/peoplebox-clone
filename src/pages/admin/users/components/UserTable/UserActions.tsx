import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { User } from "../../types";

interface UserActionsProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onPasswordChange: (userId: string) => void;
}

export default function UserActions({ user, onEdit, onDelete, onPasswordChange }: UserActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(user)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPasswordChange(user.id)}>
          Change Password
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => onDelete(user.id)}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}