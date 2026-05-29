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

        // Support for nested 'data' object (Found in TRANSACTION_UPDATE events)
        var data = params.data || params;

        // 2. Extract fields (Case-insensitive and nested support)
        var txnid = data.txnid || data.txn_id || data.TXNID || "N/A";
        var firstname = data.firstname || data.name || data.FIRSTNAME || "Guest";
        var email = data.email || data.EMAIL;
        var amount = data.amount || data.AMOUNT || "0";
        var status = (data.status || data.STATUS || "").toLowerCase();
        var productinfo = data.productinfo || data.PRODUCTINFO || "One Night to Bloom with Grouch Ticket";

        // Debugging: Send raw data to your email if DEBUG_EMAIL is set
        if (DEBUG_EMAIL) {
            MailApp.sendEmail(DEBUG_EMAIL, "Easebuzz Webhook Debug",
                "Extracted Status: " + status +
                "\nExtracted Email: " + email +
                "\nExtracted Name: " + firstname +
                "\nRaw Data:\n" + JSON.stringify(e, null, 2));
        }

        // 3. Only send email if payment is successful
        if (status === "success" || status === "successful") {
            if (email) {
                sendConfirmationEmail(email, firstname, txnid, amount, productinfo);
            } else if (DEBUG_EMAIL) {
                MailApp.sendEmail(DEBUG_EMAIL, "Easebuzz Alert: Success but no Email Found", "Parsed Data: " + JSON.stringify(data));
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
    str.split("&").forEach(function (part) {
        var item = part.split("=");
        var key = decodeURIComponent(item[0]);
        var val = decodeURIComponent(item[1] || "");
        obj[key] = val;
    });
    return obj;
}

function sendConfirmationEmail(customerEmail, name, txnid, amount, productinfo) {
    if (!customerEmail) return;

    var isTable = (productinfo || "").toLowerCase().indexOf("table") !== -1;
    var subject = isTable
      ? "🌸 Your Table Booking for One Night to Bloom with Grouch is Confirmed!"
      : "🌸 Your Tickets for One Night to Bloom with Grouch are Confirmed!";

    // Generate QR Code URL (using goqr.me API for reliability)
    var qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(customerEmail);

    var welcomeText = isTable
      ? "Thank you for booking a table (<strong>" + productinfo + "</strong>) for <strong>One Night to Bloom with Grouch</strong>. We are thrilled to host you and your guests for a premium experience."
      : "Thank you for booking your tickets for <strong>One Night to Bloom with Grouch</strong>. We are thrilled to have you join us for this journey of sound and flow arts.";

    var noteText = isTable
      ? "Please keep this email/Transaction ID handy at the entrance. Note that entry is restricted to 21+ only and the cover charge (fully redeemable on F&B) will be applicable at the gate."
      : "Please keep this email/Transaction ID handy at the entrance. Note that entry is restricted to 21+ only and a cover charge may be applicable at the gate.";

    var htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 40px 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">See You at the Bloom!</h1>
        <p style="margin-top: 10px; opacity: 0.9;">Your booking is confirmed.</p>
      </div>
      
      <div style="padding: 30px; color: #1e293b; line-height: 1.6;">
        <p>Hi <strong>${name}</strong>,</p>
        <p>${welcomeText}</p>
        
        <!-- QR Code Section -->
        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #fdf2f8; border: 2px dashed #f472b6; border-radius: 15px;">
          <h3 style="margin-top: 0; color: #db2777; font-size: 16px;">Your Digital Entry Pass</h3>
          <img src="${qrCodeUrl}" alt="QR Code" style="width: 150px; height: 150px; border: 5px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
          <p style="margin-top: 10px; font-size: 12px; color: #9d174d;">Scan at the entrance</p>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #edf2f7;">
          <h3 style="margin-top: 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Booking Details</h3>
          <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${txnid}</p>
          <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${amount}</p>
          <p style="margin: 5px 0;"><strong>Product:</strong> ${productinfo || "One Night to Bloom Ticket"}</p>
          <p style="margin: 5px 0;"><strong>Event:</strong> One Night to Bloom with Grouch</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> June 12, 2026 (6:00 PM – 1:00 AM)</p>
          <p style="margin: 5px 0;"><strong>Venue:</strong> The Humming Tree, Bangalore</p>
        </div>

        <p>${noteText}</p>
        
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

/**
 * Run this function ONCE to send emails to people who booked before the script was live.
 * In the Google Apps Script editor, select 'sendEmailsToPastBookings' in the toolbar and click 'Run'.
 */
function sendEmailsToPastBookings() {
  var pastBookings = [
    { txnid: "89T048K4", name: "Akash Suresh", email: "akashakshatha13@gmail.com", amount: "2400", product: "General Admission - Early Bird" },
    { txnid: "JFKMLGOG", name: "Karthik Unnikrishnan", email: "rockingkarthik@gmail.com", amount: "2400", product: "General Admission - Early Bird" },
    { txnid: "KN41RUNF", name: "Divyanshu Seth", email: "dsetfire@gmail.com", amount: "2400", product: "General Admission - Early Bird" },
    { txnid: "0876HX8Q", name: "Yamini Gowda", email: "yaminigowda17@gmail.com", amount: "2400", product: "General Admission - Early Bird" },
    { txnid: "MU0A9JOK", name: "Jishnu Chaudhury", email: "jishnurc519@gmail.com", amount: "2400", product: "General Admission - Early Bird" },
    { txnid: "NBPJRH7S", name: "Prathik Santhosh", email: "prathiksanthosh242@gmail.com", amount: "1200", product: "General Admission - Early Bird" },
    { txnid: "456LZ67B", name: "AKHIL NAMBIAR", email: "akhildkn10896@gmail.com", amount: "1200", product: "General Admission - Early Bird" }
  ];

  pastBookings.forEach(function(booking) {
    try {
      sendConfirmationEmail(booking.email, booking.name, booking.txnid, booking.amount, booking.product);
      Logger.log("Sent to: " + booking.email);
    } catch (e) {
      Logger.log("Failed for: " + booking.email + " Error: " + e.toString());
    }
  });
  
  return "Finished sending " + pastBookings.length + " emails.";
}
