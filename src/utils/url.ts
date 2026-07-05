import { API_URL } from '../api/client';

/**
 * Resolves a relative or absolute image path from the Laravel backend into a fully qualified URL
 * suitable for rendering in React Native's Image component.
 */
export const resolveImageUrl = (path: string | null, apiUrl?: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  const apiBase = apiUrl || API_URL;
  // Strip trailing '/api' or '/api/'
  const serverBase = apiBase.replace(/\/api\/?$/, '');
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  if (cleanPath.startsWith('storage/')) {
    return `${serverBase}/${cleanPath}`;
  }
  return `${serverBase}/storage/${cleanPath}`;
};
