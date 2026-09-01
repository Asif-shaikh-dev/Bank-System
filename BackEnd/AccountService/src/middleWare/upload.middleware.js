import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Resolve uploads folder to the root directory (outside of src/)
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 1. Core Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Unique names avoid storage collision inside the microservice instance
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// 2. Standard Document Filters (Images & PDFs)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Invalid document format. Only JPG, PNG, and PDF files are allowed.'), false);
};

// 3. Instantiate configured instance
const uploadConfig = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit per file
});

// 4. Clean Middleware Interface exports
export const upload = {
    single: (fieldName) => uploadConfig.single(fieldName),
    fields: (fieldsArray) => uploadConfig.fields(fieldsArray),
    array: (fieldName, maxCount) => uploadConfig.array(fieldName, maxCount)
};
