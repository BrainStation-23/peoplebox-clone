import { useState } from "react";
import { User } from "../types";

export const useUserFilters = (users: User[] = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSBU, setSelectedSBU] = useState("all");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesSBU =
      selectedSBU === "all" ||
      user.user_sbus?.some(
        (sbu) => sbu.is_primary && sbu.sbu.id === selectedSBU
      );

    return matchesSearch && matchesSBU;
  });

  return {
    searchTerm,
    setSearchTerm,
    selectedSBU,
    setSelectedSBU,
    filteredUsers
  };
};