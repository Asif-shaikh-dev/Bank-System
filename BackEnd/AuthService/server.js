import app from './src/app.js'
import connectDb from './src/config/db.js'

import dotenv from 'dotenv'
dotenv.config({path:'../../.env'})

const PORT = process.env.AUTH_SERVICE_PORT;


connectDb()
app.listen(PORT,()=>{
    console.log(`Auth Service running at Port : ${PORT}`)
})

