import { validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
    

    const errors = validationResult(req);
    
    // If express-validator found any errors, stop the request right here
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array().map(err => ({ field: err.path, message: err.msg })) 
        });
    }
    
    // If everything is fine, move to the next function (your register function)
    next();
};
