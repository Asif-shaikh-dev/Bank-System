import express from "express"
import cors from "cors"
import path from "path"
import onBoardingRouter from "./routes/onboarding.route.js"
import multer from "multer"
import adminRouter from "./routes/admin.routes.js"
import cookieParser from 'cookie-parser';
import accountsRouter from "./routes/accounts.route.js";
import profileRouter from "./routes/profile.route.js";
const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json())
app.use(cookieParser())

// Same resolution as UPLOAD_DIR in upload.middleware.js (process.cwd() + 'uploads'),
// so this serves the exact folder multer writes to.
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/onboarding",onBoardingRouter)
app.use("/api/admin/onboarding",onBoardingRouter)
app.use("/api/admin",adminRouter)

//accounts route
app.use("/api/accounts", accountsRouter);

//profile route
app.use("/api/profile", profileRouter);


app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'Uploaded file size exceeds the 5MB limit.' });
        }
        return res.status(400).json({ success: false, message: `Upload system error: ${err.message}` });
    }
    
    if (err.message && err.message.includes('Invalid document format')) {
        return res.status(400).json({ success: false, message: err.message });
    }

    return res.status(500).json({ success: false, message: 'Internal Server Error' });
});


app.get("/",(req,res)=>{
    res.send("Hello from Account Service")
})

export default app;