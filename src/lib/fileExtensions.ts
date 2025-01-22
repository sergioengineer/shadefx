export const imgExtensions = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "tiff",
  "tif",
  "webp",
  "ico",
  "svg",
  "heic",
  "heif",
  "raw",
  "nef",
  "cr2",
  "orf",
  "arw",
  "dng",
  "psd",
  "ai",
  "eps",
  "cdr",
]);

export const videoExtensions = new Set([
  "mp4",
  "avi",
  "mkv",
  "mov",
  "flv",
  "wmv",
  "webm",
  "mpg",
  "mpeg",
  "3gp",
  "m4v",
  "ogv",
  "ts",
  "vob",
  "rm",
  "rmvb",
  "asf",
  "divx",
  "f4v",
]);

export const allowedExtensions = [...imgExtensions, ...videoExtensions]
  .map((x) => "." + x)
  .join(",");

export function getExtension(fileName: string) {
  if (!fileName) return "";

  return fileName.split(".").at(-1) ?? "";
}

export function isImage(fileExtension: string) {
  return imgExtensions.has(fileExtension.toLowerCase());
}
