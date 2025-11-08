"use client";

import { Input } from "@/components/ui/input";
import { Search, Clock } from "lucide-react";
import { useState } from "react";
import { useTodayHours } from "@/app/dashboard/attendance/session-hooks";
import { Card } from "@/components/ui/card";

export function HeaderActions() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: todayHours } = useTodayHours();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={handleSearch}
          className="pl-9 w-64"
        />
      </div>

      {todayHours && (
        <Card className="px-4 py-2 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <Clock className="size-5 text-primary" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium">
                Today&apos;s Hours
              </span>
              <span className="text-2xl font-bold text-primary tabular-nums">
                {todayHours.hours}h {todayHours.minutes}m
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
