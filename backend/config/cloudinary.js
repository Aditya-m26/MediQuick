// backend/config/cloudinary.js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary with credentials from .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage engine: auto-uploads to Cloudinary when multer processes the file
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        // Folder based on upload type (stores / prescriptions / general)
        const folder = req.query.folder || "mediquick/uploads";
        return {
            folder,
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            transformation: [{ quality: "auto", fetch_format: "auto" }],
            // Public ID = timestamp + original name (spaces → underscores)
            public_id: Date.now() + "_" + file.originalname.replace(/\s+/g, "_").split(".")[0],
        };
    },
});

// Multer instance (max 5 MB per file)
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { cloudinary, upload };
