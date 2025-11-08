import "dotenv/config";
import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@my-better-t-app/auth";
import attendanceRoutes from "./routes/attendance";
import employeeRoutes from "./routes/employee";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.all("/api/auth{/*path}", toNodeHandler(auth));

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.use("/api/attendance", attendanceRoutes);
app.use("/api/employee", employeeRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
