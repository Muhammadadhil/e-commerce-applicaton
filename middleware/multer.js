const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "ecommerce-images",
        allowed_formats: ["jpeg", "png", "jpg"],
    },
});
const upload = multer({ storage: storage });
module.exports = upload;
