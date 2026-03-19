import { randomUUID } from "crypto";
import path from "path";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-session";
import { isValidAdminSession } from "@/lib/admin-auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/network";
import { detectImageExtension } from "@/lib/file-signatures";
import { logAuditEvent } from "@/lib/audit-log";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = await consumeRateLimit({
      key: `upload:${ip}`,
      limit: 20,
      windowMs: 60_000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Забагато запитів на завантаження. Спробуйте за хвилину." },
        { status: 429 },
      );
    }

    const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isAdmin = await isValidAdminSession(sessionToken);
    if (!isAdmin) {
      await logAuditEvent({
        action: "admin.upload.denied",
        actor: "unknown",
        severity: "warn",
        details: { ip },
      });
      return NextResponse.json({ error: "Немає доступу до завантаження файлів." }, { status: 401 });
    }

    const formData = await request.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "Файл не передано." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(fileEntry.type)) {
      return NextResponse.json({ error: "Непідтримуваний формат файлу." }, { status: 400 });
    }

    if (fileEntry.size === 0 || fileEntry.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Розмір файлу має бути від 1B до 5MB." }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await fileEntry.arrayBuffer());
    const extension = detectImageExtension(fileBuffer);
    if (!extension) {
      return NextResponse.json({ error: "Файл не є валідним зображенням." }, { status: 400 });
    }
    const uniqueName = `${Date.now()}-${randomUUID()}${extension}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const destinationPath = path.join(uploadsDir, uniqueName);
    await fs.writeFile(destinationPath, fileBuffer);

    await logAuditEvent({
      action: "admin.upload.success",
      actor: "admin",
      details: { ip, fileName: uniqueName, size: fileEntry.size },
    });

    return NextResponse.json(
      {
        url: `/uploads/${uniqueName}`,
      },
      { status: 201 },
    );
  } catch (error) {
    await logAuditEvent({
      action: "admin.upload.failed",
      actor: "admin",
      severity: "error",
      details: { error: error instanceof Error ? error.message : "UNKNOWN_ERROR" },
    });
    return NextResponse.json({ error: "Помилка завантаження файлу." }, { status: 500 });
  }
}
