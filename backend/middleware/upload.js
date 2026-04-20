const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');
const { StatusCodes } = require('http-status-codes');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Ensure upload directories exist
['images', 'documents', 'videos', 'avatars'].forEach((dir) => {
    const fullPath = path.join(UPLOAD_DIR, dir);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let subDir = 'images';
        if (file.mimetype.startsWith('video/')) subDir = 'videos';
        else if (
            file.mimetype === 'application/pdf' ||
            file.mimetype.includes('document') ||
            file.mimetype.includes('spreadsheet')
        ) subDir = 'documents';
        else if (file.fieldname === 'avatar') subDir = 'avatars';
        cb(null, path.join(UPLOAD_DIR, subDir));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/quicktime', 'video/webm',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(StatusCodes.BAD_REQUEST, 'File type not allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});

module.exports = upload;
