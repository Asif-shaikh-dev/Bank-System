import app from './src/app.js'
import connectDb from './src/config/db.js';

import dotenv from 'dotenv'
dotenv.config({path:'../../.env'})



const PORT = process.env.TRANSACTION_SERVICE_PORT 




connectDb()


app.listen(PORT,()=>{
    console.log(`Server running at Port : ${PORT}`)
})

