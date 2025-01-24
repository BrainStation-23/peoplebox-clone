import { useState } from "react";
import { User } from "../types";

export const useUserFilters = (users: User[] = [], selectedSBU: string) => {
  const [searchTerm, setSearchTerm] = useState("");

  return {
    searchTerm,
    setSearchTerm,
    filteredUsers: users
  };
};