# Create Test Agent Account

## Option 1: Using API Endpoint (Recommended if server is running)

Make a POST request to create a test agent:

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "fullName": "Test Agent",
  "email": "testagent@swagat.com",
  "password": "testagent123",
  "phoneNumber": "9876543210",
  "role": "agent"
}
```

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Agent",
    "email": "testagent@swagat.com",
    "password": "testagent123",
    "phoneNumber": "9876543210",
    "role": "agent"
  }'
```

**Using Postman/Thunder Client:**
- Method: POST
- URL: `http://localhost:5000/api/auth/register`
- Headers: `Content-Type: application/json`
- Body (JSON):
```json
{
  "fullName": "Test Agent",
  "email": "testagent@swagat.com",
  "password": "testagent123",
  "phoneNumber": "9876543210",
  "role": "agent"
}
```

## Option 2: Using Script (Requires MongoDB running)

Run the script when MongoDB is available:

```bash
node backend/scripts/createTestAgent.js
```

## Test Agent Credentials

After creation, use these credentials to login:

- **Email:** `testagent@swagat.com`
- **Password:** `testagent123`
- **Role:** `agent`
- **Phone:** `9876543210`

## Login Endpoint

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "testagent@swagat.com",
  "password": "testagent123"
}
```

