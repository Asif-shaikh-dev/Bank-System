import app from './src/app.js'
import connectDb from './src/config/db.js';
import dotenv from 'dotenv'
dotenv.config({path:'../../.env'})

const PORT = process.env.BRANCH_SERVICE_PORT || 3000

connectDb()
// import Branch from "./src/models/Branch.model.js";

// await Branch.insertOne(
//   {
//     branch_name: "Pune Camp Branch",
//     branch_code: "HDFC001",
//     IFSC_code: "HDFC0001234",
//     branch_address: "2415, MG Road, Camp, Pune, Maharashtra - 411001",
//     total_customers: 1250,
//   }
// );

console.log("Initial branch data inserted successfully.");


app.listen(PORT,()=>{
    console.log(`Branch Service running at Port : ${PORT}`);
})


