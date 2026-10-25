import app from './src/app.js'
import connectDb from './src/config/db.js';

import dotenv from 'dotenv'
const result = dotenv.config({path:'../../.env'})


console.log( `Loaded environment variables from ${result.parsed ? 'file' : 'process.env'}:`, result.parsed || process.env
);
const PORT = process.env.ACCOUNT_SERVICE_PORT ;




connectDb()


app.listen(PORT,()=>{
    console.log(`Server running at Port : ${PORT}`)
})

