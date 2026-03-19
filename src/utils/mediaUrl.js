const baseUrl = import.meta.env.VITE_API_URL;

export function getMediaUrl(path) {
  return path ? `${baseUrl}${path}` : null;
}
