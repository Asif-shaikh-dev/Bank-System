import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
    loan_id:{
        type:String,
        required:true,
        unique:true,
    },
    acc_no:{
        type:String,
        required:true,
    },
    loan_type:{
        type:String,
        required:true,
    },
    loan_amount:{
        type:Number,
        required:true,
    },
    interest_rate:{
        type:Number,
        required:true,
    },
    loan_term:{
        type:Number,
        required:true,
    },
    start_date:{
        type:Date,
        default:Date.now(),
    },
    end_date:{
        type:Date,
        required:true,
    },
});


export default mongoose.model('Loan', loanSchema);

