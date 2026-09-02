const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { UPLOADS_DIR } = require("../config/paths");
const ExpressError = require("../utils/ExpressError");

const IMAGE_TYPES = /^image\/(jpeg|png|webp)$/;
const VIDEO_TYPES = /^video\/(mp4|webm|quicktime)$/;

// Certificates aren't always images, so this set also allows PDFs and Word docs
const DOCUMENT_TYPES = /^(image\/(jpeg|png|webp)|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/;

// What an Organizer can attach to a Post: images, videos, and documents
// (PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX).
const POST_MEDIA_TYPES = /^(image\/(jpeg|png|webp)|video\/(mp4|webm|quicktime)|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/vnd\.ms-powerpoint|application\/vnd\.openxmlformats-officedocument\.presentationml\.presentation|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)$/;

// uploads/ is gitignored, so a fresh clone has no such directory and multer's
// diskStorage would throw ENOENT on the first upload. Create it once at load.
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Post attachments can include video, which never fits the 5MB cap used for
// single-image/certificate uploads elsewhere.
const POST_MAX_FILE_SIZE = 25 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
});

// Builds a multer instance accepting one mimetype set. Every uploader shares the
// same disk storage, so new upload routes never restate that config.
const createUploader = (allowedTypes, maxFileSize = MAX_FILE_SIZE) => multer({
    storage,
    limits: { fileSize: maxFileSize },
    fileFilter: (req, file, cb) => {
        // Reject with an error rather than cb(null, false): silently dropping the
        // file leaves req.file unset, so the controller reports "No file uploaded"
        // even though the user did select one - just an unsupported type.
        if (!allowedTypes.test(file.mimetype)) {
            return cb(new ExpressError(400, `Unsupported file type: ${file.mimetype}`));
        }
        cb(null, true);
    },
});

module.exports = {
    IMAGE_TYPES,
    VIDEO_TYPES,
    DOCUMENT_TYPES,
    POST_MEDIA_TYPES,
    MAX_FILE_SIZE,
    POST_MAX_FILE_SIZE,
    createUploader,
    uploadImage: createUploader(IMAGE_TYPES),
    uploadDocument: createUploader(DOCUMENT_TYPES),
    uploadPostMedia: createUploader(POST_MEDIA_TYPES, POST_MAX_FILE_SIZE),
};
