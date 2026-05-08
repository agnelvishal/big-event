/**
 * Google Apps Script to handle Easebuzz Webhooks and send confirmation emails.
 * Deploy this as a Web App with "Access: Anyone".
 */

function doPost(e) {
    try {
        // 1. Parse the incoming data from Easebuzz
        // Easebuzz sends data as form-urlencoded by default
        var params = e.parameter;

        // If it's JSON, uncomment the line below
        // var params = JSON.parse(e.postData.contents);

        var txnid = params.txnid || "N/A";
        var firstname = params.firstname || "Guest";
        var email = params.email;
        var amount = params.amount || "0";
        var status = params.status;
        var productinfo = params.productinfo || "Symbolico Live Ticket";

        // 2. Only send email if payment is successful
        if (status === "success") {
            sendConfirmationEmail(email, firstname, txnid, amount, productinfo);

            // Optional: Notify the organizer
            // sendOrganizerNotification(firstname, email, txnid, amount);
        }

        // 3. Return success to Easebuzz
        return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);

    } catch (error) {
        Logger.log("Error: " + error.toString());
        return ContentService.createTextOutput("Error").setMimeType(ContentService.MimeType.TEXT);
    }
}

function sendConfirmationEmail(customerEmail, name, txnid, amount, productinfo) {
    if (!customerEmail) return;

    var subject = "🌸 Your Tickets for Symbolico Live are Confirmed!";

    var htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 40px 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">See You at the Bloom!</h1>
        <p style="margin-top: 10px; opacity: 0.9;">Your booking is confirmed.</p>
      </div>
      <div style="padding: 30px; color: #1e293b; line-height: 1.6;">
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for booking your tickets for <strong>Symbolico Live | One Night to Bloom</strong>. We are thrilled to have you join us for this journey of sound and flow arts.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
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

function sendOrganizerNotification(name, email, txnid, amount) {
    var organizerEmail = "YOUR_EMAIL@GMAIL.COM"; // CHANGE THIS
    MailApp.sendEmail({
        to: organizerEmail,
        subject: "New Ticket Booking: " + name,
        body: `New booking received!\n\nName: ${name}\nEmail: ${email}\nAmount: ${amount}\nTXN ID: ${txnid}`
    });
}

