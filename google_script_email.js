/**
 * Google Apps Script to handle Easebuzz Webhooks and send confirmation emails.
 * 
 * INSTRUCTIONS:
 * 1. Replace 'YOUR_EMAIL@GMAIL.COM' with your actual email to receive debug logs.
 * 2. Click 'Deploy' > 'New Deployment'.
 * 3. Select 'Web App'.
 * 4. Execute as: 'Me'.
 * 5. Who has access: 'Anyone'.
 * 6. Copy the URL and paste it in Easebuzz Webhook settings.
 * 
 * IMPORTANT: Every time you change this code, you MUST create a NEW VERSION 
 * in the Deployment settings for changes to take effect.
 */

var DEBUG_EMAIL = ""; // Add your email here to receive raw logs for every attempt

function doPost(e) {
  try {
    // 1. Parse the incoming data
    var rawData = e.postData ? e.postData.contents : "";
    var params = {};

    // Try parsing as JSON first
    try {
      if (rawData) {
        params = JSON.parse(rawData);
      }
    } catch (err) {
      // Fallback to form parameters
      params = e.parameter || {};
    }

    // If params is still empty, try parsing rawData as form-urlencoded manually
    if (Object.keys(params).length === 0 && rawData) {
      params = parseFormEncoded(rawData);
    }

    // 2. Extract fields (Case-insensitive support)
    var txnid = params.txnid || params.TXNID || "N/A";
    var firstname = params.firstname || params.FIRSTNAME || "Guest";
    var email = params.email || params.EMAIL;
    var amount = params.amount || params.AMOUNT || "0";
    var status = (params.status || params.STATUS || "").toLowerCase();
    var productinfo = params.productinfo || params.PRODUCTINFO || "Symbolico Live Ticket";

    // Debugging: Send raw data to your email if DEBUG_EMAIL is set
    if (DEBUG_EMAIL) {
      MailApp.sendEmail(DEBUG_EMAIL, "Easebuzz Webhook Debug", 
        "Status: " + status + "\nEmail: " + email + "\nRaw Data:\n" + JSON.stringify(e, null, 2));
    }

    // 3. Only send email if payment is successful
    if (status === "success" || status === "successful") {
      if (email) {
        sendConfirmationEmail(email, firstname, txnid, amount, productinfo);
      } else if (DEBUG_EMAIL) {
        MailApp.sendEmail(DEBUG_EMAIL, "Easebuzz Alert: Success but no Email", "Payload: " + JSON.stringify(params));
      }
    }

    // 4. Return success to Easebuzz
    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    if (DEBUG_EMAIL) {
      MailApp.sendEmail(DEBUG_EMAIL, "Easebuzz Script Error", error.toString() + "\n\nData: " + JSON.stringify(e));
    }
    return ContentService.createTextOutput("Error: " + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Parses application/x-www-form-urlencoded strings
 */
function parseFormEncoded(str) {
  var obj = {};
  str.split("&").forEach(function(part) {
    var item = part.split("=");
    var key = decodeURIComponent(item[0]);
    var val = decodeURIComponent(item[1] || "");
    obj[key] = val;
  });
  return obj;
}

function sendConfirmationEmail(customerEmail, name, txnid, amount, productinfo) {
  if (!customerEmail) return;

  var subject = "🌸 Your Tickets for Symbolico Live are Confirmed!";

  var htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 40px 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">See You at the Bloom!</h1>
        <p style="margin-top: 10px; opacity: 0.9;">Your booking is confirmed.</p>
      </div>
      <div style="padding: 30px; color: #1e293b; line-height: 1.6;">
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for booking your tickets for <strong>Symbolico Live | One Night to Bloom</strong>. We are thrilled to have you join us for this journey of sound and flow arts.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #edf2f7;">
          <h3 style="margin-top: 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Booking Details</h3>
          <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${txnid}</p>
          <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${amount}</p>
          <p style="margin: 5px 0;"><strong>Event:</strong> Symbolico Live</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> May 23, 2026</p>
          <p style="margin: 5px 0;"><strong>Venue:</strong> GYLT, Bangalore</p>
        </div>

        <p>Please keep this email/Transaction ID handy at the entrance. Note that entry is restricted to 21+ only and a cover charge may be applicable at the gate.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="font-size: 14px; color: #94a3b8;">Bloomingreen Festival x Future Sound Experience</p>
        </div>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: customerEmail,
    subject: subject,
    htmlBody: htmlBody
  });
}
