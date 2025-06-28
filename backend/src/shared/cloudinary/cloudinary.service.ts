import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private isConfigured = false;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.isConfigured = true;
    } else {
      console.warn('Cloudinary not configured. Image uploads will use placeholder URLs.');
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: 'image',
        folder: 'shoppie-products',
      });
      return result.secure_url;
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async uploadImageBuffer(buffer: Buffer, filename: string): Promise<string> {
    if (!this.isConfigured) {
      // Return a placeholder URL if Cloudinary is not configured
      return 'https://via.placeholder.com/400x400?text=Product+Image';
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'shoppie-products',
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Failed to upload image: ${error.message}`));
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Upload failed: No result returned'));
          }
        }
      );
      
      uploadStream.end(buffer);
    });
  }
} 