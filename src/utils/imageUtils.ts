/**
 * Utility functions for handling image paths in both development and production
 * Ensures images work correctly on both localhost and GitHub Pages deployment
 */

/**
 * Gets the correct public asset path based on environment
 * @param path - The path relative to the public folder (e.g., "/front.jpeg")
 * @returns The correct path for the current environment
 */
export const getPublicAssetPath = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In development, use the path as-is
  if (import.meta.env.DEV) {
    return `/${cleanPath}`;
  }
  
  // In production (GitHub Pages), prepend the base path
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${cleanPath}`;
};

/**
 * Gets the default venue image path
 */
export const getDefaultVenueImage = (): string => {
  return getPublicAssetPath('/lovable-uploads/021553a3-f52a-4d73-b0f9-75f2a94711cb.png');
};

/**
 * Gets the front page hero image path
 */
export const getFrontImage = (): string => {
  return getPublicAssetPath('/front.jpeg');
};

/**
 * Gets the placeholder SVG path
 */
export const getPlaceholderImage = (): string => {
  return getPublicAssetPath('/placeholder.svg');
};