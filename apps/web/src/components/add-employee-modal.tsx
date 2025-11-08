"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface AddEmployeeModalProps {
  onEmployeeAdded?: () => void;
}

export function AddEmployeeModal({ onEmployeeAdded }: AddEmployeeModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    // Split the full name into firstName and lastName
    const fullName = (formData.get("name") as string).trim();
    const nameParts = fullName.split(/\s+/); // Split by whitespace
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || nameParts[0] || ""; // Use first name as last name if only one word

    const data = {
      firstName,
      lastName,
      middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : undefined,
      email: formData.get("email") as string,
      // companyName will be automatically set from the logged-in user's company on the backend
      dateOfJoining: formData.get("dateOfJoining") as string, // Send as ISO string
      basicSalary: parseFloat(formData.get("basicSalary") as string),
      department: (formData.get("department") as string) || undefined,
      designation: (formData.get("designation") as string) || undefined,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/employees/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        const employeeData = result.data;
        toast.success("Employee created successfully!", {
          description: `Employee Code: ${employeeData.employeeCode} | Password: ${employeeData.temporaryPassword} | Credentials sent to ${data.email}`,
          duration: 10000,
        });
        setOpen(false);
        (e.target as HTMLFormElement).reset();
        onEmployeeAdded?.();
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>Enter employee details. Login credentials will be generated and sent via email.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input id="name" name="name" placeholder="e.g., John Doe" required />
              <p className="text-xs text-muted-foreground">First and last name will be extracted from this field</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input id="email" name="email" type="email" placeholder="employee@company.com" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfJoining">
                  Date of Joining <span className="text-red-500">*</span>
                </Label>
                <Input id="dateOfJoining" name="dateOfJoining" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basicSalary">
                  Basic Salary <span className="text-red-500">*</span>
                </Label>
                <Input id="basicSalary" name="basicSalary" type="number" step="0.01" placeholder="50000" required />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
