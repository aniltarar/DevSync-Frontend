const baseUrl = import.meta.env.VITE_API_URL;

export function getMediaUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${baseUrl}${path}`;
}
