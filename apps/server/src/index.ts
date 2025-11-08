import "dotenv/config";
import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@my-better-t-app/auth";
import attendanceRoutes from "./routes/attendance";
import employeeRoutes from "./routes/employee";
import authRoutes from "./routes/auth";
import sessionRoutes from "./routes/session";
import leaveRoutes from "./routes/leave";
import permissionsRoutes from "./routes/permissions";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

// Better Auth handler - handles all authentication endpoints
app.all("/api/auth/*splat", toNodeHandler(auth));

// API Routes
app.use("/api", authRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/permissions", permissionsRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
