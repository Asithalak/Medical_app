import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import path from 'path';

/**
 * Configure Cloudinary using environment variables.
 * Safe initialization: checks if credentials are provided.
 */
export function initCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName.trim(),
      api_key: apiKey.trim(),
      api_secret: apiSecret.trim(),
      secure: true,
    });
  }
}

/**
 * Check if Cloudinary credentials are fully configured in the environment.
 */
export function isCloudinaryConfigured(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  return Boolean(
    cloudName &&
    apiKey &&
    apiSecret &&
    cloudName !== 'your_cloud_name_here' &&
    apiKey !== 'your_api_key_here'
  );
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format?: string;
  bytes: number;
  original_filename: string;
}

/**
 * Upload a file Buffer directly to Cloudinary using upload_stream.
 */
export function uploadBufferToCloudinary(
  buffer: Buffer,
  originalFilename: string,
  folder = 'medilanka/medical_documents'
): Promise<CloudinaryUploadResult> {
  // Ensure cloudinary is initialized
  initCloudinary();

  return new Promise((resolve, reject) => {
    const ext = path.extname(originalFilename).toLowerCase();
    const baseName = path.basename(originalFilename, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);

    const publicId = `${Date.now()}_${baseName}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'auto',
        tags: ['medilanka', 'medical_precheck'],
        use_filename: true,
        unique_filename: true,
      },
      (error, result?: UploadApiResponse) => {
        if (error) {
          return reject(error);
        }
        if (!result || !result.secure_url) {
          return reject(new Error('Cloudinary returned an empty response.'));
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
          format: result.format,
          bytes: result.bytes,
          original_filename: originalFilename,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export default cloudinary;
