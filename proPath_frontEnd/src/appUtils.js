export function formatDate(value, locale = "ar-MA") {
  if (!value) return "غير محدد";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(value, locale = "ar-MA") {
  if (!value) return "غير محدد";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getFileUrl(resource) {
  if (!resource) return "";
  if (resource.file?.data) return resource.file.data;
  if (resource.attachment?.data) return resource.attachment.data;
  if (resource.image?.data) return resource.image.data;
  return "";
}

export function getFileName(resource, fallback = "file") {
  if (!resource) return fallback;
  return (
    resource.file?.name ||
    resource.attachment?.name ||
    resource.image?.name ||
    fallback
  );
}

export function getDownloadUrl(resource) {
  if (!resource) return "";
  return (
    resource.file?.downloadUrl ||
    resource.attachment?.downloadUrl ||
    resource.image?.downloadUrl ||
    getFileUrl(resource)
  );
}

function filenameFromDisposition(contentDisposition) {
  if (!contentDisposition) return "";

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/["']/g, ""));
  }

  const plainMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  return plainMatch?.[1] || "";
}

function triggerBrowserDownload(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "file";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadFile(url, filename = "file") {
  if (!url) return;

  try {
    const response = await fetch(url, { credentials: "include" });

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const dispositionFilename = filenameFromDisposition(
      response.headers.get("Content-Disposition"),
    );
    const objectUrl = URL.createObjectURL(blob);

    triggerBrowserDownload(objectUrl, dispositionFilename || filename);
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    triggerBrowserDownload(url, filename);
  }
}
