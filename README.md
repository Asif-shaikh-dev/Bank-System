# Authentication & User Management API

This module handles user authentication, session management using JWTs, OTP-based password recovery, and profile retrieval for a microservices-based architecture.

## ⚙️ Prerequisites & Environment Variables

Ensure the following environment variables are configured in your `.env` file before running the application:

```env
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
RESET_TOKEN_SECRET=your_reset_token_secret
EMAIL_SERVICE_PORT=9000
ACCOUNT_SERVICE_PORT=xxxx
```

**External Services Required:**
*   **Email Service:** Expected to be running on `http://localhost:<EMAIL_SERVICE_PORT>`. Listens to `/email/send-otp`.

---

## 🚀 API Endpoints

### 1. User Registration
Registers a new user in the system. Ensures no duplicate emails or phone numbers exist.

*   **Endpoint:** `POST api/auth/register`
*   **Request Body:**
    ```json
    {
      "name": "John Doe",
      "email_id": "john@example.com",
      "phone_no": "1234567890",
      "password": "securepassword123"
    }
    ```
*   **Responses:**
    *   `201 Created`: `{ "success": true, "message": "User registered successfully." }`
    *   `400 Bad Request`: Missing fields, or email/phone already registered.

### 2. User Login
Authenticates a user and issues an Access Token (15m) and an HTTP-only Refresh Token (7d).

*   **Endpoint:** `POST api/auth/login`
*   **Request Body:**
    ```json
    {
      "email_id": "john@example.com",
      "password": "securepassword123"
    }
    ```
*   **Responses:**
    *   `200 OK`: Returns `{ "message": "Login successful.", "accessToken": "..." }` and sets `refreshToken` in an HTTP-only secure cookie.
    *   `400 Bad Request`: User not found or incorrect credentials.

### 3. Refresh Access Token
Generates a fresh Access Token using a valid Refresh Token stored in cookies.

*   **Endpoint:** `POST api/refreshToken`
*   **Cookies Required:** `refreshToken`
*   **Responses:**
    *   `200 OK`: `{ "accessToken": "new_jwt_token_here" }`
    *   `401/403 Unauthorized/Forbidden`: Token missing, invalid, expired, or revoked in the database.

### 4. Forgot Password (Send OTP)
Generates a 6-digit OTP, stores it in the database with a 5-minute expiry, and triggers the external Email Service to send it.

*   **Endpoint:** `POST api/auth/forgot-password`
*   **Request Body:**
    ```json
    {
      "email": "john@example.com"
    }
    ```
*   **Responses:**
    *   `200 OK`: `{ "message": "OTP sent to your email successfully." }`
    *   `404 Not Found`: User with this email does not exist.

### 5. Verify OTP
Validates the OTP sent to the user. If successful, issues a temporary 10-minute Reset Token.

*   **Endpoint:** `POST api/auth/verify-otp`
*   **Request Body:**
    ```json
    {
      "email": "john@example.com",
      "otp": "123456"
    }
    ```
*   **Responses:**
    *   `200 OK`: `{ "message": "OTP verified successfully.", "resetToken": "..." }`
    *   `400 Bad Request`: Invalid OTP or OTP expired.

### 6. Reset Password
Resets the user's password using the token acquired from the Verify OTP step.

*   **Endpoint:** `POST api/auth/reset-password`
*   **Request Body:**
    ```json
    {
      "resetToken": "token_from_verify_otp_step",
      "newPassword": "new_secure_password"
    }
    ```
*   **Responses:**
    *   `200 OK`: `{ "message": "Password has been successfully reset. You can now log in." }`
    *   `403 Forbidden`: Invalid or expired reset token.

### 7. Get Customer Profile
Retrieves the authenticated user's profile, including their KYC status and linked banking account details.

*   **Endpoint:** `GET api/auth/profile`
*   **Headers Required:** `Authorization: Bearer <Access_Token>` (Requires JWT Middleware)
*   **Responses:**
    *   `200 OK`:
        ```json
        {
          "success": true,
          "data": {
            "user_id": 1,
            "name": "John Doe",
            "email_id": "john@example.com",
            "phone_no": "1234567890",
            "role": "user",
            "customer_cif": 101,
            "kyc_status": "verified",
            "account_number": "000123456789",
            "balance": "5000.00",
            "account_type": "savings"
          }
        }
        ```
    *   `404 Not Found`: User not found.

---

## 🗄️ Database Assumptions

This codebase assumes the PostgreSQL `pool` connection has access to the following schemas:

*   **`users` table:** `id`, `name`, `email_id`, `phone_no`, `password`, `refresh_token`, `reset_otp`, `reset_otp_expiry`, `role`
*   **`customers` table:** `id`, `user_id`, `status`
*   **`accounts` table:** `id`, `customer_id`, `account_number`, `balance`, `account_type`