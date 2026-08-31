import app from './src/app.js'
import connectDb from './src/config/db.js';
import { pool } from './src/config/db.js';
import dotenv from 'dotenv'
dotenv.config({path:'../../.env'})



const PORT = process.env.ACCOUNT_SERVICE_PORT 




connectDb()


app.listen(PORT,()=>{
    console.log(`Server running at Port : ${PORT}`)
})

