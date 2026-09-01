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
# Account Service API



## 🚀 API Endpoints

### 1. Submit Onboarding Application

Validates applicant details against Aadhaar KYC records, runs a risk assessment, and creates an onboarding application. If the application is auto-approved (risk tier `0`), a customer record and first savings account are created immediately; otherwise the application is held for manual compliance review.

*   **Endpoint:** `POST /api/onboarding/apply`
*   **Content-Type:** `multipart/form-data`
*   **Headers Required:** `Authorization: Bearer <Access_Token>` (Requires JWT Middleware)

#### Request Form Data

**Text Fields**

| Field Name | Type | Validation Rules | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Required | Full name of the applicant. Must exactly match `person_name` on the Aadhaar record (case-insensitive). |
| `email_id` | String | Required, must be a valid email format | Primary email address; used to resolve `user_id` from the `users` table. |
| `date_of_birth` | String | Required, `YYYY-MM-DD` | Date of birth. Applicant must be 18+ as of submission date. |
| `Pan_card_no` | String | Required | Permanent Account Number (PAN). |
| `residential_address` | String | Required | Current residential address. |
| `Empoyment_status` | String | Required | Current employment status. |
| `source_of_income` | String | Required | Primary source of funds. |
| `phone_no` | String | Required | Contact mobile number. |
| `aadhaar_no` | String | Required, exactly 12 numeric digits | 12-digit Aadhaar number, checked against `aadhaar_card`. |

**File Uploads**

| Field Name | Max Count | Description |
| :--- | :--- | :--- |
| `proof_of_identity` | 1 | Government-issued ID card or passport copy. |
| `proof_of_address` | 1 | Utility bill, rental agreement, or bank statement. |
| `passport_size_photo` | 1 | Recent passport-size photograph. |

#### Responses

*   **`201 Created`** — Application auto-approved; customer and account created.
```json
    {
      "success": true,
      "message": "Congratulations! Onboarding completed successfully.",
      "data": {
        "cif_id": 101,
        "application_id": 55,
        "status": "APPROVED",
        "assigned_account": "000123456789",
        "balance": 0.00
      }
    }
```

*   **`202 Accepted`** — Application submitted but held for manual review (non-zero risk tier).
```json
    {
      "success": true,
      "message": "Application submitted. Due to a risk tier of 1, your account is pending manual compliance review.",
      "application_id": 55,
      "status": "PENDING_REVIEW"
    }
```

*   **`400 Bad Request`** — Missing required text fields.
```json
    { "success": false, "message": "Missing required onboarding parameters." }
```

*   **`400 Bad Request`** — Missing one or more required files.
```json
    { "success": false, "message": "Missing required documents. Please upload identity proof, address proof, and a passport-size photo." }
```

*   **`400 Bad Request`** — Malformed or invalid date of birth.
```json
    { "success": false, "message": "Invalid date format. Use YYYY-MM-DD." }
```
```json
    { "success": false, "message": "The provided date of birth is invalid." }
```

*   **`400 Bad Request`** — Applicant under 18.
```json
    { "success": false, "message": "User must be at least 18 years old." }
```

*   **`404 Not Found`** — No matching user in the `users` table.
```json
    { "success": false, "message": "User not found in the system. Please register first." }
```

*   **`400 Bad Request`** — Aadhaar number not found in `aadhaar_card`.
```json
    { "success": false, "message": "KYC Failed: Invalid KYC number." }
```

*   **`400 Bad Request`** — Name does not match Aadhaar record.
```json
    { "success": false, "message": "KYC Failed: Name does not match government records." }
```

*   **`400 Bad Request`** — Duplicate application (same `user_id` or `aadhaar_no` already applied).
```json
    { "success": false, "message": "Duplicate entry: This user or KYC document has already applied." }
```

*   **`400 Bad Request`** — Upload validation failure (wrong file type or size, from `multer`).
```json
    { "success": false, "message": "Uploaded file size exceeds the 5MB limit." }
```
```json
    { "success": false, "message": "Invalid document format. Only JPG, PNG, and PDF files are allowed." }
```

*   **`500 Internal Server Error`**
```json
    { "success": false, "message": "Internal server onboarding failure." }
```