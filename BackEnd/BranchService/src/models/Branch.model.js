import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
    bank_code:{
        type:String,
        default:"HDFC",
    },
    legal_name:{ //HDFC Bank Limited
        type:String,
        default:"HDFC Bank Limited",
    },
    branch_name:{
        type:String,
        required:true,
    },
    branch_code:{
        type:String,
        required:true,
        unique:true,
    },

    IFSC_code:{
        type:String,
        required:true,
        unique:true,
    },
    branch_address:{
        type:String,
        required:true,
    },
    total_customers:{ type:Number, default:0},
});

export default mongoose.model("Branch", branchSchema);