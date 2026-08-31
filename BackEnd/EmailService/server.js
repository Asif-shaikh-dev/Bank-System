import app from "./src/app.js";

import dotenv from 'dotenv'
dotenv.config({path:'../../.env'})



app.listen(process.env.EMAIL_SERVICE_PORT, () => {
    console.log(`Email Service running at Port : ${process.env.EMAIL_SERVICE_PORT}`);

});