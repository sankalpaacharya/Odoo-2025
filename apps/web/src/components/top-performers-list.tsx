"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

const topPerformers = [
  {
    id: 1,
    name: "Alex Thompson",
    initials: "AT",
    department: "Engineering",
    score: 98,
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Maria Garcia",
    initials: "MG",
    department: "Sales",
    score: 96,
    color: "bg-green-500",
  },
  {
    id: 3,
    name: "David Kim",
    initials: "DK",
    department: "Marketing",
    score: 94,
    color: "bg-purple-500",
  },
  {
    id: 4,
    name: "Jennifer Lee",
    initials: "JL",
    department: "Operations",
    score: 92,
    color: "bg-orange-500",
  },
  {
    id: 5,
    name: "Robert Brown",
    initials: "RB",
    department: "Finance",
    score: 90,
    color: "bg-pink-500",
  },
];

export function TopPerformersList() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>
              Highest rated employees this month
            </CardDescription>
          </div>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topPerformers.map((performer, index) => (
            <div
              key={performer.id}
              className="flex items-center justify-between gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className={performer.color}>
                    <AvatarFallback className="text-white font-semibold">
                      {performer.initials}
                    </AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-900">
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {performer.name}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {performer.department}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-bold">{performer.score}</div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
