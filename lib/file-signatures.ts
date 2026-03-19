const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPG_SIGNATURE = [0xff, 0xd8, 0xff];

function startsWithSignature(buffer: Buffer, signature: number[]) {
  if (buffer.length < signature.length) {
    return false;
  }
  return signature.every((byte, index) => buffer[index] === byte);
}

function isGif(buffer: Buffer) {
  if (buffer.length < 6) {
    return false;
  }
  const header = buffer.subarray(0, 6).toString("ascii");
  return header === "GIF87a" || header === "GIF89a";
}

function isWebp(buffer: Buffer) {
  if (buffer.length < 12) {
    return false;
  }
  const riff = buffer.subarray(0, 4).toString("ascii");
  const webp = buffer.subarray(8, 12).toString("ascii");
  return riff === "RIFF" && webp === "WEBP";
}

function isAvif(buffer: Buffer) {
  if (buffer.length < 16) {
    return false;
  }
  const boxType = buffer.subarray(4, 8).toString("ascii");
  const brands = buffer.subarray(8, 32).toString("ascii");
  return boxType === "ftyp" && brands.includes("avif");
}

export function detectImageExtension(buffer: Buffer) {
  if (startsWithSignature(buffer, JPG_SIGNATURE)) {
    return ".jpg";
  }
  if (startsWithSignature(buffer, PNG_SIGNATURE)) {
    return ".png";
  }
  if (isGif(buffer)) {
    return ".gif";
  }
  if (isWebp(buffer)) {
    return ".webp";
  }
  if (isAvif(buffer)) {
    return ".avif";
  }

  return null;
}
