# Customer OTP Verification System

## Overview
This system implements OTP (One Time Password) verification for customer registration using Twilio SMS service.

## Features
- ✅ OTP generation and SMS delivery via Twilio
- ✅ Temporary data storage in local memory
- ✅ OTP expiry (5 minutes)
- ✅ Maximum 3 attempts for OTP verification
- ✅ Resend OTP functionality
- ✅ Automatic cleanup of expired OTPs

## API Endpoints

### 1. Send OTP for Registration
```
POST /api/customers/send-otp
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your phone number",
  "phone": "+1234567890"
}
```

### 2. Verify OTP and Register
```
POST /api/customers/verify-otp
```
**Request Body:**
```json
{
  "phone": "+1234567890",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer registered successfully",
  "customerId": 1
}
```

### 3. Resend OTP
```
POST /api/customers/resend-otp
```
**Request Body:**
```json
{
  "phone": "+1234567890"
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install twilio
```

### 2. Environment Variables
Create a `.env` file with the following variables:
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# Other required variables...
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
```

### 3. Twilio Setup
1. Sign up for a Twilio account
2. Get your Account SID and Auth Token from the Twilio Console
3. Get a Twilio phone number for sending SMS
4. Add these credentials to your `.env` file

## Registration Flow

1. **Customer fills registration form** → Frontend calls `/send-otp`
2. **Backend validates data** → Checks if customer already exists
3. **OTP generated and sent** → Via Twilio SMS
4. **Customer enters OTP** → Frontend calls `/verify-otp`
5. **OTP verified** → Customer data inserted into database
6. **Registration complete** → Customer can now login

## Security Features

- **OTP Expiry**: OTPs expire after 5 minutes
- **Attempt Limiting**: Maximum 3 attempts per OTP
- **Automatic Cleanup**: Expired OTPs are automatically removed
- **Duplicate Prevention**: Checks for existing customers before OTP generation

## Error Handling

- Invalid OTP
- Expired OTP
- Too many attempts
- Twilio SMS failure
- Database errors
- Duplicate customer registration

## Production Considerations

- Replace in-memory storage with Redis or database
- Add rate limiting for OTP requests
- Implement proper logging
- Add monitoring for SMS delivery
- Consider using email OTP as backup 