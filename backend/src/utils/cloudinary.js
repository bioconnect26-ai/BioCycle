import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

export const createMulterStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `biocycle/${folder}`,
      resource_type: "auto",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    },
  });
};

export const uploadImage = multer({
  storage: createMulterStorage("images"),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single("image");

export const uploadVideo = multer({
  storage: createMulterStorage("videos"),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
}).single("video");

export const deleteCloudinaryFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw error;
  }
};

export const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `biocycle/${folder}`,
    });
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};
