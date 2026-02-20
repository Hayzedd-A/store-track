import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Upload an image to Cloudinary
 * @param file - File buffer or stream
 * @param folder - Folder path in Cloudinary
 * @param publicId - Optional public ID for the resource
 * @returns Upload response with secure_url
 */
export async function uploadImage(
  file: Buffer,
  folder: string = 'store-track',
  publicId?: string
) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'auto',
        overwrite: publicId ? true : false,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(file);
  });
}

/**
 * Delete an image from Cloudinary
 * @param publicId - Public ID of the resource to delete
 */
export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}
