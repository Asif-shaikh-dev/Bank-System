import multer from "multer";
import path from "path";
import fs from "fs";

// Same pattern as AccountService/src/middleWare/upload.middleware.js —
// this file didn't exist yet in LoanService, so I've added it fresh.
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error("Invalid document format. Only JPG, PNG, and PDF files are allowed."), false);
};

const uploadConfig = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

export const upload = {
    single: (fieldName) => uploadConfig.single(fieldName),
    fields: (fieldsArray) => uploadConfig.fields(fieldsArray),
    array: (fieldName, maxCount) => uploadConfig.array(fieldName, maxCount),
};