import axios from 'axios';


const checkAccountNumber = (req, res, next) => {
    try{
        const { acc_no } = req.body;

        if (!acc_no || typeof acc_no !== 'string' || !/^\d+$/.test(acc_no)) {
            return res.status(400).json({ message: "Invalid account number format." });
        }

        if(!accountExists(acc_no)){
           return res.status(400).json({message:"Account nunmber does not exists."})
        }
        next();
    }catch(error){
        console.log(error);
    }

}

const accountExists = async (acc_no) => {
    try {
        const response = await axios.get(`http://localhost:1000/auth/verify/${acc_no}`);
        return response.data.exists;
    } catch (error) {
        console.error("Error checking account existence:", error);
        throw new Error("Account verification service failed.");
    }
}


export default checkAccountNumber;