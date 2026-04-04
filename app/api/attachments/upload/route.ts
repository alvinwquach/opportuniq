/**
 * Encrypted Attachment Upload API
 *
 * Receives pre-encrypted files from the client and stores them in Supabase Storage.
 * Server CANNOT decrypt the files - only stores encrypted blobs.
 *
 * FLOW:
 * 1. Client encrypts file with group's master key
 * 2. Client uploads encrypted blob to this endpoint
 * 3. Server stores blob in Supabase Storage
 * 4. Server creates metadata record in encryptedAttachments table
 * 5. Returns attachment ID and storage path
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { encryptedAttachments } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Max file sizes
const MAX_IMAGE_SIZE = 50 * 1024 * 1024;   // 50MB for images
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;  // 100MB for videos

// Allowed storage bucket
const STORAGE_BUCKET = "encrypted-attachments";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await req.formData();

    // Get encrypted file blob
    const encryptedFile = formData.get("file") as Blob | null;
    if (!encryptedFile) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get file type early for size validation
    const type = (formData.get("type") as string) || "image";
    const maxSize = type === "video" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    const maxSizeMB = type === "video" ? 100 : 50;

    // Validate file size based on type
    if (encryptedFile.size > maxSize) {
      return NextResponse.json(
        { error: `File too large (max ${maxSizeMB}MB)` },
        { status: 400 }
      );
    }

    // Get encryption metadata (required)
    const iv = formData.get("iv") as string | null;
    if (!iv) {
      return NextResponse.json(
        { error: "Missing encryption IV" },
        { status: 400 }
      );
    }

    // Get file metadata
    const mimeType = (formData.get("mimeType") as string) || "application/octet-stream";
    const fileName = formData.get("fileName") as string | null;
    const originalSize = parseInt(formData.get("originalSize") as string) || 0;

    // Optional: group ID (for group-shared attachments)
    const groupId = formData.get("groupId") as string | null;

    // Optional: message ID (for linking to chat message)
    const messageId = formData.get("messageId") as string | null;

    // Optional: key version (default 1)
    const keyVersion = parseInt(formData.get("keyVersion") as string) || 1;

    // Optional: image/video dimensions
    const width = formData.get("width") ? parseInt(formData.get("width") as string) : null;
    const height = formData.get("height") ? parseInt(formData.get("height") as string) : null;

    // Optional: video duration in seconds
    const durationSeconds = formData.get("durationSeconds")
      ? parseInt(formData.get("durationSeconds") as string)
      : null;

    // Generate unique storage path
    const fileId = uuidv4();
    const storagePath = `${user.id}/${fileId}.enc`;

    // Upload encrypted blob to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, encryptedFile, {
        contentType: "application/octet-stream", // Always octet-stream for encrypted files
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Create attachment record in database
    const [attachment] = await db
      .insert(encryptedAttachments)
      .values({
        userId: user.id,
        groupId: groupId || null,
        messageId: messageId || null,
        storagePath,
        storageBucket: STORAGE_BUCKET,
        iv,
        keyVersion,
        algorithm: "AES-GCM-256",
        status: "encrypted",
        fileName,
        mimeType,
        type: type as "image" | "video" | "audio" | "document",
        fileSizeBytes: originalSize,
        encryptedSizeBytes: encryptedFile.size,
        width,
        height,
        durationSeconds,
      })
      .returning({
        id: encryptedAttachments.id,
        storagePath: encryptedAttachments.storagePath,
      });


    return NextResponse.json({
      success: true,
      attachment: {
        attachmentId: attachment.id,
        storagePath: attachment.storagePath,
        iv,
        mimeType,
        originalSize,
        encryptedSize: encryptedFile.size,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET - Retrieve attachment metadata (not the file itself)
 * File download happens directly from Supabase Storage
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const attachmentId = searchParams.get("id");

    if (!attachmentId) {
      return NextResponse.json(
        { error: "Missing attachment ID" },
        { status: 400 }
      );
    }

    // Fetch attachment metadata
    const [attachment] = await db
      .select()
      .from(encryptedAttachments)
      .where(eq(encryptedAttachments.id, attachmentId));

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    // Check access: user must own the attachment or be in the same group
    // TODO: Add group membership check when groups are implemented
    if (attachment.userId !== user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Generate signed URL for download (expires in 1 hour)
    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from(attachment.storageBucket)
      .createSignedUrl(attachment.storagePath, 3600);

    if (signedUrlError) {
      return NextResponse.json(
        { error: "Failed to generate download URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      attachment: {
        id: attachment.id,
        iv: attachment.iv,
        mimeType: attachment.mimeType,
        fileName: attachment.fileName,
        originalSize: attachment.fileSizeBytes,
        keyVersion: attachment.keyVersion,
        downloadUrl: signedUrl.signedUrl,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
