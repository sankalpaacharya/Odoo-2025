/**
 * Utility functions for handling image URLs from the backend
 */

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

/**
 * Get the full URL for an uploaded image
 * @param imagePath - The path from the backend (e.g., "/uploads/profile-images/image.jpg")
 * @returns Full URL to access the image
 */
export function getImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // If it starts with /uploads, append to API URL
  if (imagePath.startsWith("/uploads")) {
    return `${API_URL}${imagePath}`;
  }

  // Otherwise, assume it's a relative path and prepend /uploads
  return `${API_URL}/uploads/${imagePath}`;
}

/**
 * Get the profile image URL with fallback
 * @param profileImage - The profileImage field from the employee
 * @param userImage - The image field from the user (fallback)
 * @returns Full URL to the image or null
 */
export function getProfileImageUrl(profileImage: string | null | undefined, userImage?: string | null | undefined): string | null {
  return getImageUrl(profileImage) || getImageUrl(userImage);
}
