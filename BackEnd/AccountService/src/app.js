import express from "express"
import onBoardingRouter from "./routes/onboarding.route.js"
import multer from "multer"
const app = express();

app.use(express.json())


app.use("/api/onboarding",onBoardingRouter)

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

    // fallback regular server errors
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
});


app.get("/",(req,res)=>{
    res.send("Hello from Account Service")
})

export default app;