import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = 'photos'
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { 
            width: 1920, 
            height: 1920, 
            crop: 'limit', 
            quality: 'auto:good',
            fetch_format: 'auto'
          },
        ],
        eager: [
          { 
            width: 400, 
            height: 400, 
            crop: 'fill', 
            quality: 'auto:low',
            fetch_format: 'auto'
          },
        ],
        eager_async: false,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(new Error('Failed to upload image'));
        }
        
        if (!result) {
          return reject(new Error('No result from Cloudinary'));
        }

        resolve({
          url: result.secure_url,
          thumbnailUrl: result.eager[0].secure_url,
          width: result.width,
          height: result.height,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export default cloudinary;