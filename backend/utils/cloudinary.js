const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// This config uses your .env variables automatically
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fabric-inventory', // A folder name in Cloudinary to keep images organized
    allowed_formats: ['jpeg', 'png', 'jpg'],
  },
});

// This is our new "upload helper".
const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };