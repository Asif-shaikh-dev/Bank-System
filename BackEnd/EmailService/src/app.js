import express from "express";
import emailRouter from "./routes/sendEmail.js";
const app = express();

app.use(express.json());

app.use("/email", emailRouter);


app.get('/', (req, res) => {
    res.send("Hello from Email Service");
});

export default app;