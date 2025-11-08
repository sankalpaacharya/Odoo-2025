"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployee } from "@/lib/employee-context";
import { Pencil } from "lucide-react";
import { useState } from "react";
import PrivateInfoTab from "./PrivateInfoTab";
import ResumeTab from "./ResumeTab";
import SalaryInfoTab from "./SalaryInfoTab";

export default function ProfilePage() {
  const { employee } = useEmployee();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">My Profile</h1>

        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[auto_1fr_1fr]">
              {/* Column 1 - Profile Photo */}
              <div className="flex items-start justify-center lg:justify-start">
                <button
                  type="button"
                  className="group relative h-36 w-36 overflow-hidden rounded-full bg-pink-100 transition-all hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
                >
                  <div className="flex h-full w-full items-center justify-center">
                    <Pencil className="h-8 w-8 text-pink-600 transition-transform group-hover:scale-110" />
                  </div>
                </button>
              </div>

              {/* Column 2 - Name, Login ID, Email, Mobile */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-foreground">
                    My Name
                  </Label>
                  <Input
                    value={`${employee?.firstName || ""} ${
                      employee?.lastName || ""
                    }`}
                    readOnly={!isEditing}
                    className="h-10 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Login ID
                  </Label>
                  <Input
                    value={employee?.employeeCode || ""}
                    readOnly
                    className="h-10 bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    readOnly={!isEditing}
                    className="h-10 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Mobile
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    readOnly={!isEditing}
                    className="h-10 transition-colors"
                  />
                </div>
              </div>

              {/* Column 3 - Company, Department, Manager, Location */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Company
                  </Label>
                  <div className="flex h-10 items-center">
                    <Badge className="rounded-md bg-cyan-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-600">
                      test
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Department
                  </Label>
                  <Input
                    value={employee?.department || ""}
                    readOnly={!isEditing}
                    className="h-10 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Manager
                  </Label>
                  <Input
                    placeholder="Manager Name"
                    readOnly={!isEditing}
                    className="h-10 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Location
                  </Label>
                  <Input
                    placeholder="Location"
                    readOnly={!isEditing}
                    className="h-10 transition-colors"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <div>
          {/* Tabs Section */}
          <Tabs defaultValue="resume" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="private">Private Info</TabsTrigger>
              <TabsTrigger value="salary">Salary Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="resume" className="mt-8">
              <ResumeTab isEditing={isEditing} setIsEditing={setIsEditing} />
            </TabsContent>
            <TabsContent value="private" className="mt-8">
              <PrivateInfoTab isEditing={isEditing} />
            </TabsContent>

            <TabsContent value="salary" className="mt-8">
              <SalaryInfoTab isEditing={isEditing} />
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    Security settings content goes here...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
