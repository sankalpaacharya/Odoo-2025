"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import type { FormEvent } from "react";

export default function CreateEmployeePage() {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      middleName: (formData.get("middleName") as string) || undefined,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || undefined,
      companyName: formData.get("companyName") as string,
      department: (formData.get("department") as string) || undefined,
      designation: (formData.get("designation") as string) || undefined,
      dateOfJoining: new Date(formData.get("dateOfJoining") as string),
      basicSalary: parseFloat(formData.get("basicSalary") as string),
      role: "EMPLOYEE",
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/employees/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (result.success) {
        setGeneratedCode(result.data.employeeCode);
        setGeneratedPassword(result.data.temporaryPassword);
        toast.success("Employee created successfully!");
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(result.error || "Failed to create employee");
      }
    } catch (error) {
      toast.error("An error occurred while creating employee");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Employee</CardTitle>
          <CardDescription>
            Fill in the employee details. Employee code and temporary password
            will be auto-generated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedCode && generatedPassword && (
            <Card className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg">
                  Employee Created Successfully!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="flex justify-between">
                  <span className="font-semibold">Employee Code:</span>
                  <span className="font-mono">{generatedCode}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Temporary Password:</span>
                  <span className="font-mono">{generatedPassword}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  ⚠️ Please share these credentials securely with the employee.
                  They should change the password on first login.
                </p>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company Information</h3>
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="e.g., Odoo India"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input id="firstName" name="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input id="middleName" name="middleName" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input id="lastName" name="lastName" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Employment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" name="department" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input id="designation" name="designation" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfJoining">
                    Date of Joining <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dateOfJoining"
                    name="dateOfJoining"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="basicSalary">
                    Basic Salary <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="basicSalary"
                    name="basicSalary"
                    type="number"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Employee..." : "Create Employee"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
