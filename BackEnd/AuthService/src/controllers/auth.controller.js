import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from 'axios';
import { pool } from "../config/db.js";
import { comparePasswords } from "../utils/password.js";



const checkCustomerExists = async (email_id, phone_no) => {
  const cleanEmail = email_id.trim().toLowerCase();
  const clearPhone = phone_no.replace(/\D/g, "");

  console.log(
    `Checking existence for email: ${cleanEmail}, phone: ${clearPhone}`
  );

  const query = `
        select id,name,email_id,phone_no
        from users 
        where email_id= $1 or phone_no= $2
        LIMIT 1;
    `;

  try {
    const result = await pool.query(query, [cleanEmail, clearPhone]);
    // console.log(`Database query result:`, result.rows);

    if (result.rows.length > 0) {
      const foundUser = result.rows[0];

      if (foundUser.email_id === cleanEmail) {
        return { exists: true, message: "Email is already registered." };
      }

      if (foundUser.phone_no === clearPhone) {
        return { exists: true, message: "Phone number is already registered." };
      }
    }
    return { exists: false, message: "Both fields are available." };
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

export const register = async (req, res) => {
  const { name, email_id, phone_no, password } = req.body;

  if (!name || !email_id || !phone_no || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await checkCustomerExists(email_id, phone_no);

  if (result.exists == true) {
    return res.status(400).json({ message: result.message });
  }

  const cleanEmail = email_id.trim().toLowerCase();
  const clearPhone = phone_no.replace(/\D/g, "");

  const query = `
        insert into users(name,email_id,phone_no,password)
        values($1,$2,$3,$4)
    `;

  try {
    await pool.query(query, [name, cleanEmail, clearPhone, hashedPassword]);

    return res
      .status(201)
      .json({ success: true, message: "User registered successfully." });
  } catch (error) {
    console.error("Database insertion error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const login = async (req, res) => {
  const { email_id, password } = req.body;
  console.log(`Login attempt for email: ${email_id}`);
  if (!email_id || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const query = `
        select id,name,email_id,phone_no,password
        from users 
        where email_id= $1
        LIMIT 1;
    `;
  const result = await pool.query(query, [email_id]);

  if (result.rows.length == 0) {
    return res.status(400).json({ message: "User not found." });
  }
  // console.log(result.rows[0]);

  const user = result.rows[0];

  const isMatch = await comparePasswords(password, user.password);

  if (!isMatch) {
    return res
      .status(400)
      .json({ message: "Incorrect Credentials (password)." });
  }

  const accessToken = jwt.sign(
    { userId: user.id, email: user.email_id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  // Generate Long-Lived Refresh Token (7 Days)
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  //store refresh token in database
  await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [refreshToken,user.id]);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // Prevents frontend JS from reading the cookie
    secure:  process.env.NODE_ENV === "production", // Ensures cookie is sent over HTTPS only
    sameSite: "strict", // Prevents CSRF attacks
    path:"/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  // Send Access Token to frontend memory
  return res.status(200).json({
    message: "Login successful.",
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email_id,
      phone: user.phone_no
    }
  });
};

// ==========================================
// LOGOUT
// ==========================================
export const logout = async (req, res) => {
  const cookies = req.cookies;

  // No cookie at all — nothing to do, but still respond success
  // so the frontend can safely clear its own state either way.
  if (!cookies?.refreshToken) {
    return res.status(200).json({ success: true, message: "Already logged out." });
  }

  const refreshToken = cookies.refreshToken;

  try {
    // Invalidate the refresh token server-side by clearing it from the DB.
    // This is what actually revokes the session — clearing the cookie alone
    // only affects this browser, it doesn't stop the token from being reused
    // elsewhere if it were ever copied out (e.g. via a compromised client).
    await pool.query(
      `UPDATE users SET refresh_token = NULL WHERE refresh_token = $1`,
      [refreshToken]
    );
  } catch (error) {
    console.error("Logout DB error:", error);
    // Don't block logout on a DB hiccup — still clear the cookie below
  }

  // IMPORTANT: clearCookie options must match the options used in res.cookie()
  // when it was set (path, sameSite, secure, httpOnly) or the browser will
  // treat it as a different cookie and silently no-op.
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return res.status(200).json({ success: true, message: "Logged out successfully." });
};


export const refreshAccessToken = async (req, res) => {
  // 1. Grab the refresh token out of the incoming cookies
  const cookies = req.cookies;
  if (!cookies?.refreshToken) {
    return res.status(401).json({ message: "Unauthorized. No refresh token found." });
  }

  const refreshToken = cookies.refreshToken;

  try {
    // 2. VERIFY FIRST: This throws an error directly to the catch block if expired/tampered
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // 3. FASTER DB QUERY: Look up by Primary Key (id) instead of searching by the token string
    const dbResult = await pool.query(
      'SELECT id, email_id, refresh_token FROM users WHERE id = $1 LIMIT 1', 
      [decoded.userId]
    );

    if (dbResult.rows.length === 0) {
      return res.status(403).json({ message: "Forbidden. User does not exist." });
    }

    const user = dbResult.rows[0];

    // 4. CROSS-CHECK: Ensure the token in the DB matches the one in the cookie
    if (user.refresh_token !== refreshToken) {
       return res.status(403).json({ message: "Forbidden. Invalid or revoked session token." });
    }

    // 5. Generate a fresh new Access Token (15 Minutes)
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email_id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    // 6. Ship it straight back to the frontend memory
    return res.status(200).json({ accessToken: newAccessToken });

  } catch (error) {
    console.error("Token renewal error:", error);
    // jwt.verify automatically throws here if the token is expired or malformed
    return res.status(403).json({ message: "Expired or invalid session token. Please log in again." });
  }
};
  




// ==========================================
// 1. FORGOT PASSWORD (Send OTP)
// ==========================================
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }

    try {
        // Check if user exists
        const userQuery = await pool.query(`SELECT id FROM users WHERE email_id = $1 LIMIT 1;`, [email]);
        
        if (userQuery.rows.length === 0) {
            return res.status(404).json({ message: "User with this email does not exist." });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Set expiry for 5 minutes from now
        const expiryDate = new Date(Date.now() + 5 * 60 * 1000);

        // Save OTP and expiry to the database
        await pool.query(
            `UPDATE users SET reset_otp = $1, reset_otp_expiry = $2 WHERE email_id = $3`,
            [otp, expiryDate, email]
        );

        // Call your external Email Service running on port 9000
        try {
            await axios.post(process.env.EMAIL_SERVICE_URL + "/email/send-otp", {email: email,otp: otp});

            return res.status(200).json({ message: "OTP sent to your email successfully." });
        } catch (error) {
            console.error("Error sending OTP email:", error);
            return res.status(500).json({ message: "Failed to send OTP. Please try again later." });
        }

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};


// ==========================================
// 2. VERIFY OTP
// ==========================================
export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required." });
    }

    try {
        const userQuery = await pool.query(
            `SELECT id, reset_otp, reset_otp_expiry FROM users WHERE email_id = $1 LIMIT 1;`,
            [email]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        const user = userQuery.rows[0];

        // Check if OTP matches
        if (user.reset_otp !== otp.toString()) {
            return res.status(400).json({ message: "Invalid OTP." });
        }

        // Check if OTP is expired
        if (new Date() > new Date(user.reset_otp_expiry)) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        // OTP is valid! 
        // Clear the OTP from DB so it can't be reused
        await pool.query(`UPDATE users SET reset_otp = NULL, reset_otp_expiry = NULL WHERE id = $1`, [user.id]);

        // Generate a temporary token to allow them to reset the password (valid for 10 mins)
        // Note: Add RESET_TOKEN_SECRET to your .env file
        const resetToken = jwt.sign(
            { userId: user.id }, 
            process.env.RESET_TOKEN_SECRET || 'fallback_secret', 
            { expiresIn: '10m' }
        );

        return res.status(200).json({ 
            message: "OTP verified successfully.", 
            resetToken: resetToken 
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};


// ==========================================
// 3. RESET PASSWORD
// ==========================================
export const resetPassword = async (req, res) => {
    // The frontend must send the resetToken (received from verifyOtp) and the new password
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
        return res.status(400).json({ message: "Reset token and new password are required." });
    }

    try {
        // Verify the temporary reset token
        const decoded = jwt.verify(resetToken, process.env.RESET_TOKEN_SECRET || 'fallback_secret');

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the password in the database
        await pool.query(
            `UPDATE users SET password = $1 WHERE id = $2`,
            [hashedPassword, decoded.userId]
        );

        return res.status(200).json({ message: "Password has been successfully reset. You can now log in." });

    } catch (error) {
        console.error("Reset Password Error:", error);
        // If jwt.verify fails (token tampered or expired), it jumps here
        return res.status(403).json({ message: "Invalid or expired reset token. Please restart the forgot password process." });
    }
};




// ==========================================
// 4. GET CUSTOMER PROFILE
// ==========================================
export const getCustomerProfile = async (req, res) => {
    try {
        // req.user is set by the JWT middleware (created below)
        // This ensures a user can only request their own data
        const userId = req.user.userId;

        // Using LEFT JOIN connects the tables securely.
        // If they have no account yet, those fields will safely return as 'null'
        const query = `
            SELECT 
                u.id AS user_id,
                u.name,
                u.email_id,
                u.phone_no,
                u.role,
                c.id AS customer_cif,
                c.status AS kyc_status,
                a.account_number,
                a.balance,
                a.account_type
            FROM users u
            LEFT JOIN customers c ON u.id = c.user_id
            LEFT JOIN accounts a ON c.id = a.customer_id
            WHERE u.id = $1;
        `;
        
        const result = await pool.query(query, [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Get customer profile error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};