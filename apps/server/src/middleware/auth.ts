import type { Request, Response, NextFunction } from "express";
import { auth } from "@my-better-t-app/auth";

export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    (req as any).user = session.user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
