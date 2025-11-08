"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export function HeaderActions() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // You can implement search logic here
    // For example, use URL params or context to filter employees
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input type="search" placeholder="Search employees..." value={searchQuery} onChange={handleSearch} className="pl-9 w-64" />
    </div>
  );
}
