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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_USERS.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Input defaultValue={user.username} className="h-9" />
                    </TableCell>
                    <TableCell>
                      <Input defaultValue={user.loginId} className="h-9" />
                    </TableCell>
                    <TableCell>
                      <Input defaultValue={user.email} className="h-9" />
                    </TableCell>
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
