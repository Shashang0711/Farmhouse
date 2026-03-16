import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "../_lib/auth";
import { Role } from "@prisma/client";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import crypto from "crypto";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function safeExtFromFile(file: File) {
  const fromName = path.extname(file.name || "").toLowerCase();
  if (fromName && /^[.][a-z0-9]+$/.test(fromName)) return fromName;

  const type = (file.type || "").toLowerCase();
  if (type === "image/jpeg") return ".jpg";
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  return "";
}

export async function POST(req: NextRequest) {
  try {
    requireRole(req, [Role.ADMIN]);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Unauthorized" },
      { status: err.message === "Forbidden" ? 403 : 401 }
    );
  }

  const form = await req.formData();
  const files = form.getAll("files").filter((v): v is File => v instanceof File);

  if (!files.length) {
    return NextResponse.json({ message: "files are required" }, { status: 400 });
  }

  // Basic guardrails to avoid abuse
  const maxFiles = 50;
  if (files.length > maxFiles) {
    return NextResponse.json(
      { message: `Too many files (max ${maxFiles}).` },
      { status: 400 }
    );
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const uploaded: { url: string; name: string; size: number; type: string }[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Only image uploads are supported." },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const ext = safeExtFromFile(file) || ".img";
    const filename = `${crypto.randomUUID()}${ext}`;
    const diskPath = path.join(UPLOAD_DIR, filename);
    await writeFile(diskPath, buf);
    uploaded.push({
      url: `/uploads/${filename}`,
      name: file.name,
      size: file.size,
      type: file.type
    });
  }

  return NextResponse.json({ files: uploaded }, { status: 201 });
}

