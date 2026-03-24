import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { env } from '../config/env.js';

// Auto-configured via CLOUDINARY_URL env var.
// Explicit config as fallback for environments where the env var name differs.
if (env.CLOUDINARY_URL) {
  // cloudinary SDK reads CLOUDINARY_URL automatically, nothing to do
} else if (env.NODE_ENV === 'production') {
  console.warn('CLOUDINARY_URL is not set — uploads will fail');
}

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  thumbnail: string | null;
}

/**
 * Upload a base64-encoded image or a remote URL to Cloudinary.
 */
export async function uploadImage(
  file: string,
  folder: string,
): Promise<UploadResult> {
  const result: UploadApiResponse = await cloudinary.uploader.upload(file, {
    folder: `momentee/${folder}`,
    resource_type: 'image',
    transformation: [
      { width: 1920, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });

  // Generate a small thumbnail
  const thumbnail = cloudinary.url(result.public_id, {
    width: 200,
    height: 200,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    thumbnail,
  };
}

/**
 * Upload an avatar with face-aware cropping.
 */
export async function uploadAvatar(file: string): Promise<UploadResult> {
  const result: UploadApiResponse = await cloudinary.uploader.upload(file, {
    folder: 'momentee/avatars',
    resource_type: 'image',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    thumbnail: null,
  };
}

/**
 * Upload a video to Cloudinary.
 */
export async function uploadVideo(
  file: string,
  folder: string,
): Promise<UploadResult> {
  const result: UploadApiResponse = await cloudinary.uploader.upload(file, {
    folder: `momentee/${folder}`,
    resource_type: 'video',
    eager: [{ format: 'jpg', transformation: [{ width: 400, crop: 'fill' }] }],
  });

  const thumbnail =
    result.eager?.[0]?.secure_url ??
    cloudinary.url(result.public_id, {
      resource_type: 'video',
      format: 'jpg',
      transformation: [{ width: 400, crop: 'fill' }],
    });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    thumbnail,
  };
}

/**
 * Upload a base64-encoded audio file to Cloudinary.
 * Cloudinary uses resource_type 'video' for audio files.
 */
export async function uploadAudio(
  file: string,
  folder: string,
): Promise<{ url: string; publicId: string; duration: number; format: string; bytes: number }> {
  const result: UploadApiResponse = await cloudinary.uploader.upload(file, {
    folder: `momentee/${folder}`,
    resource_type: 'video',
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    duration: Math.round(result.duration ?? 0),
    format: result.format,
    bytes: result.bytes,
  };
}

/**
 * Delete an asset by its public_id.
 */
export async function deleteAsset(
  publicId: string,
  resourceType: 'image' | 'video' = 'image',
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
