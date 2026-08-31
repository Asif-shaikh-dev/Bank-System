import {validationResult} from 'express-validator';

export const createLoan = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

   
    try {
      const {acc_no, loan_amount, loan_type} = req.body;
      
      


    } catch (error) { 
      console.error("Error creating loan:", error);
      res.status(500).json({ message: "Internal server error" });
      
    }

}