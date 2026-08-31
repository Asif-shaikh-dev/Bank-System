
import express from 'express'
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import refreshTokenRouter from './routes/refreshToken.route.js';
import cookieParser from 'cookie-parser';
const app = express();


// 2. Add CORS middleware BEFORE your routes
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your exact React URL
    credentials: true                // CRITICAL: Allows the browser to send the httpOnly cookie
}));

app.use(express.json())
app.use(cookieParser())

app.use("/api/refreshToken",refreshTokenRouter)
app.use("/api/auth",authRouter)

app.get('/',(req,res)=>{
    res.send("Hello from Auth Service")
})

export default app;












