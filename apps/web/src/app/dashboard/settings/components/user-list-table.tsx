"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { ROLES } from "../constants";

const MOCK_USERS = [
  {
    id: 1,
    username: "john.doe",
    loginId: "john_doe",
    email: "abcd@gmail.com",
    role: "Admin",
  },
  {
    id: 2,
    username: "jane.smith",
    loginId: "jane_smith",
    email: "jane@gmail.com",
    role: "HR Officer",
  },
  {
    id: 3,
    username: "bob.wilson",
    loginId: "bob_wilson",
    email: "bob@gmail.com",
    role: "Payroll Officer",
  },
  {
    id: 4,
    username: "alice.brown",
    loginId: "alice_brown",
    email: "alice@gmail.com",
    role: "Employee",
  },
];

export function UserListTable() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage users and assign roles to control access rights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button>Add User</Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User name</TableHead>
                  <TableHead>Login id</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_USERS.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.loginId}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select defaultValue={user.role}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => router.push(`/dashboard/settings/users/${user.id}` as any)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => router.push(`/dashboard/settings/users/${user.id}/edit` as any)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
