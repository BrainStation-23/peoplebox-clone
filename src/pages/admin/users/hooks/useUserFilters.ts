import { useState } from "react";
import { User } from "../types";

export const useUserFilters = (users: User[] = [], selectedSBU: string) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((user) => {
    const matchesSBU =
      selectedSBU === "all" ||
      user.user_sbus?.some((sbu) => sbu.sbu_id === selectedSBU);

    return matchesSBU;
  });

  return {
    searchTerm,
    setSearchTerm,
    filteredUsers
  };
};