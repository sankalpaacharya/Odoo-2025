import path from "path";
import { fileURLToPath } from "url";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the uploads directory (one level up from utils, then into uploads)
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

/**
 * Central configuration for all upload paths
 * This ensures consistency across the application
 */
export const UPLOADS_CONFIG = {
  // Base uploads directory - this is the absolute path to packages/db/uploads
  BASE_DIR: UPLOADS_DIR,

  // Subdirectories for different types of uploads
  PROFILE_IMAGES: path.join(UPLOADS_DIR, "profile-images"),
  LOGOS: path.join(UPLOADS_DIR, "logos"),
  LEAVE_ATTACHMENTS: path.join(UPLOADS_DIR, "leave-attachments"),

  // URL paths (what the client will use to access files)
  URL_PREFIX: "/uploads",
  PROFILE_IMAGES_URL: "/uploads/profile-images",
  LOGOS_URL: "/uploads/logos",
  LEAVE_ATTACHMENTS_URL: "/uploads/leave-attachments",
} as const;

/**
 * Get the full file system path for an upload
 * @param relativePath - The relative path (e.g., "/uploads/profile-images/file.jpg")
 */
export function getUploadPath(relativePath: string): string {
  // Remove /uploads prefix if present
  const cleanPath = relativePath.replace(/^\/uploads\//, "");
  return path.join(UPLOADS_CONFIG.BASE_DIR, cleanPath);
}

/**
 * Get the URL path for an upload
 * @param filename - The filename (e.g., "profile-123456.jpg")
 * @param type - The type of upload
 */
export function getUploadUrl(
  filename: string,
  type: "profile" | "logo" | "leave"
): string {
  switch (type) {
    case "profile":
      return `${UPLOADS_CONFIG.PROFILE_IMAGES_URL}/${filename}`;
    case "logo":
      return `${UPLOADS_CONFIG.LOGOS_URL}/${filename}`;
    case "leave":
      return `${UPLOADS_CONFIG.LEAVE_ATTACHMENTS_URL}/${filename}`;
    default:
      return `${UPLOADS_CONFIG.URL_PREFIX}/${filename}`;
  }
}
