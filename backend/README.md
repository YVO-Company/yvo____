# YVO Backend (Express)

यह backend Express पर बना है और login के लिए email/password + Google login दोनों सपोर्ट करता है।
MongoDB optional है — अगर आप DB connect नहीं करना चाहते, तो `SKIP_DB=true` से in-memory mode चालू हो जाएगा (डेटा server restart पर हट जाएगा)।

## जल्दी से शुरू करें
1. `.env` बनाएं:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. values भरें और server चलाएं:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

डिफ़ॉल्ट पोर्ट `4000` है।

## Environment Variables
- `PORT` — Server port.
- `MONGO_URI` — MongoDB connection string (अगर DB चाहिए).
- `SKIP_DB` — `true` होने पर DB connection skip होगा और in-memory store use होगा.
- `JWT_SECRET` — JWT signing secret.
- `SMTP_USER`, `SMTP_PASS` — Email notifications/OTP भेजने के लिए.
- `MAIL_FROM` — Email from address.
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` — Admin login.
- `ADMIN_EMAIL` — Plan purchase के बाद admin को email भेजने के लिए.
- `GOOGLE_CLIENT_ID` — Google login (ID token verify).
- `STRIPE_SECRET_KEY` — Stripe API key.
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signature secret.
- `STRIPE_SUCCESS_URL` — Payment success redirect.
- `STRIPE_CANCEL_URL` — Payment cancel redirect.
- `STRIPE_CURRENCY` — Default currency (e.g. `usd`).

## Auth APIs
### Password Login
- `POST /auth/register`
  - Body: `{ "fullName": "User", "email": "user@example.com", "password": "strongpassword", "phone": "+911234567890", "businessType": "Retail" }`
- `POST /auth/login`
  - Body: `{ "method": "email", "email": "user@example.com", "password": "strongpassword" }`

### Google Login
- `POST /auth/google`
  - Body: `{ "idToken": "<google_id_token>", "businessType": "Retail" }`

> सभी login/register responses में `needsPlan` मिलेगा ताकि front-end plan खरीदने के लिए redirect कर सके।

## Plans APIs
- `GET /plans`
  - Response: `{ plans: [...] }`
- `POST /plans` (SUPER_ADMIN only)
  - Body: `{ "name": "Starter", "price": 999, "billingCycle": "MONTHLY", "limits": { "users": 3 } }`

## Billing APIs (Stripe)
- `POST /billing/checkout`
  - Body: `{ "planId": "<plan_id>", "successUrl": "https://yourapp.com/success", "cancelUrl": "https://yourapp.com/cancel" }`
  - Response: `{ "sessionId": "...", "url": "https://checkout.stripe.com/..." }`
- `POST /billing/webhook`
  - Stripe webhook (raw JSON). On success, subscription active हो जाएगी और admin को email जाएगा।

## Admin Login
- `POST /admin/login`
  - Body: `{ "username": "admin", "password": "secret" }`

## Health Check
- `GET /`
  - Response: `{ "status": "ok", "message": "Auth service running" }`
