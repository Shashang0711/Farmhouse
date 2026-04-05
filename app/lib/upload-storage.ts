import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Production uploads: set on Render (or any host with ephemeral disk)
 * - S3_UPLOAD_BUCKET — bucket name (required to use S3)
 * - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY — credentials
 * - AWS_REGION — e.g. ap-south-1 (default ap-south-1)
 * - S3_PUBLIC_BASE_URL — optional; full base for object URLs, e.g.
 *   https://my-bucket.s3.ap-south-1.amazonaws.com or a CloudFront URL.
 *   If omitted, URLs use virtual-hosted style:
 *   https://{bucket}.s3.{region}.amazonaws.com/{key}
 * - S3_ENDPOINT — optional; for S3-compatible APIs (R2, MinIO). When set,
 *   S3_PUBLIC_BASE_URL should be the public URL prefix for GET requests.
 *
 * Local dev: leave S3 unset to write under public/uploads and return /uploads/...
 *
 * Bucket policy must allow public GetObject on the uploads/* prefix (or use a CDN).
 *
 * For rows still storing `/uploads/...`, set NEXT_PUBLIC_MEDIA_BASE_URL in the Next.js
 * build to the same public object origin (no trailing slash) so the UI resolves them.
 */

const DEFAULT_REGION = 'ap-south-1';

function stripTrailingSlash(s: string) {
  return s.replace(/\/+$/, '');
}

export function useS3Upload(): boolean {
  const bucket = process.env.S3_UPLOAD_BUCKET?.trim();
  const key = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secret = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  return Boolean(bucket && key && secret);
}

function publicObjectUrl(bucket: string, region: string, objectKey: string): string {
  const base = process.env.S3_PUBLIC_BASE_URL?.trim();
  if (base) {
    return `${stripTrailingSlash(base)}/${objectKey}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`;
}

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const region = process.env.AWS_REGION?.trim() || DEFAULT_REGION;
    const endpoint = process.env.S3_ENDPOINT?.trim();
    s3Client = new S3Client({
      region,
      ...(endpoint
        ? {
            endpoint,
            forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
          }
        : {}),
    });
  }
  return s3Client;
}

export async function uploadImageToS3(params: {
  body: Buffer;
  contentType: string;
  objectKey: string;
}): Promise<string> {
  const bucket = process.env.S3_UPLOAD_BUCKET!.trim();
  const region = process.env.AWS_REGION?.trim() || DEFAULT_REGION;

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.objectKey,
      Body: params.body,
      ContentType: params.contentType,
    }),
  );

  return publicObjectUrl(bucket, region, params.objectKey);
}
