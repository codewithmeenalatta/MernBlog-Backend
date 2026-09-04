import cloudinary from "../config/cloudinary.js";
export const uploadBufferToCloudinary = (Buffer , folder  = "blog-posts") => {
    return new Promise((resolve , reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {folder},
            (err , result) => {
                if (err) return reject(err);
                resolve(result)
            }
        );
        stream.end(Buffer)
    });
};