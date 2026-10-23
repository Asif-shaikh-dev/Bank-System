import jwt from "jsonwebtoken";

/**
 * FLAG: your root .env defines ACCESS_TOKEN_SECRET / REFRESH_TOKEN_SECRET,
 * but AuthService/src/middleware/JWT.js signs/verifies against
 * process.env.JWT_SECRET, which isn't defined anywhere in the .env you
 * showed me. That means AuthService's own token verification is
 * currently reading `undefined` as the secret. I'm mirroring JWT.js
 * exactly (JWT_SECRET) for consistency across services, but you need to
 * either add JWT_SECRET to your .env, or tell me to switch this (and
 * JWT.js) to ACCESS_TOKEN_SECRET instead.
 */
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // ASSUMPTION: decoded token carries { id, email } for the user,
        // matching the shape AuthService signs at login. If your
        // auth.controller.js signs different field names (e.g. `userId`
        // instead of `id`), update loan.util.js's resolveCustomerId()
        // to match — that's the only place this shape is consumed.
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: "Forbidden" });
    }
};