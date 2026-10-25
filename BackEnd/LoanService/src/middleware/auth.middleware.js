import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("Auth header present:", !!authHeader);

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Missing token" });
    }

    const token = authHeader.split(" ")[1];
    try {
        // BackEnd/LoanService/src/middleware/auth.middleware.js
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = { ...decoded, id: decoded.userId };
        next();
        
    } catch (error) {
        console.log("JWT verify failed:", error.message);
        console.log("Token payload (unverified):", jwt.decode(token));
        return res.status(401).json({ success: false, message: error.message });
    }
};