import express from "express"
import onBoardingRouter from "./routes/onboarding.route.js"

const app = express();

app.use(express.json())


app.use("/api/onboarding",onBoardingRouter)

app.get("/",(req,res)=>{
    res.send("Hello from Account Service")
})

export default app;