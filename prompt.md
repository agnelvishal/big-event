Read README.md html, css and js files.

Below is plan executed.

# Email Notification Integration Plan

Since the website is static (GitHub Pages), we will use **Google Apps Script** as a lightweight backend to receive payment notifications from Easebuzz and send confirmation emails to customers.

## 1. Google Apps Script Webhook
We will create a script that:
- Listens for POST requests from Easebuzz.
- Extracts customer details (name, email, transaction ID, amount).
- Sends a beautifully formatted HTML email.

## 2. Easebuzz Configuration
The user will need to:
- Log in to Easebuzz Dashboard.
- Go to **Webhooks** settings.
- Add the Google Apps Script deployment URL as the webhook for "Success" events.

## 3. Thank-You Page Enhancement
- Update `thank-you.html` to check for URL parameters (if any) to show a personalized message.
- Add a fallback message if parameters are missing.

---

# Step 1: Create Google Apps Script

1. Go to [script.google.com](https://script.google.com/).
2. Create a new project named "Symbolico Ticket Emailer".
3. Replace the code with the provided script below.
4. Click **Deploy** > **New Deployment**.
5. Select **Web App**.
6. Set "Execute as" to **Me**.
7. Set "Who has access" to **Anyone** (this is necessary for Easebuzz to reach the URL).
8. Copy the **Web App URL**.

# Step 2: Configure Easebuzz Webhook

1. Log in to your Easebuzz dashboard.
2. Go to **Settings** > **Webhooks**.
3. Paste the Web App URL into the "Transaction Webhook" or "Success URL" field (depending on your Easebuzz version).
4. Ensure the event type is set to `payment_success` or similar.

# Step 3: Update Website Code

I will update the `thank-you.html` to handle potential incoming parameters and improve the UX.

code used is google_script_email.js

But email not received.

In https://easebuzz.in/merchant/webhook, below is there

TXN ID 	Status 	Attempt 	Event 	Triggered date 	Action
COF39CT9 	success 	1 	TRANSACTION UPDATE 	08 May 2026, 5:52PM 	


In https://docs.easebuzz.in/docs/payment-gateway/587zy3v064so6-what-are-webhooks, there  is webhooks-easebuzz.txt

In https://docs.easebuzz.in/docs/payment-gateway/paw9n1qc3kuoz-transaction-webhook there is easebuzz-transaction-webhook.txt


