import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3_BUCKET = process.env.S3_BUCKET_NAME!;
const S3_REGION = process.env.S3_REGION || "us-east-1";

// Initialize S3 Client
// Credentials are automatically loaded from process.env.AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
export const s3Client = new S3Client({
    region: S3_REGION,
});

/**
 * Uploads a file to S3 with Server-Side Encryption (SSE-S3)
 */
export async function uploadVoiceFile(
    fileBuffer: Buffer,
    key: string,
    contentType: string
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        ServerSideEncryption: "AES256", // Enforce encryption at rest
    });

    await s3Client.send(command);
    return key;
}

/**
 * Generates a presigned URL for secure read access (expires in 1 hour)
 */
export async function getVoiceDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Deletes a file from S3 (e.g. on revocation)
 */
export async function deleteVoiceFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
    });

    await s3Client.send(command);
}
