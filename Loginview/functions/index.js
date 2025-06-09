// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer'); // You'll need to install: npm install nodemailer

admin.initializeApp();

// Configure the email transporter (example using Gmail SMTP with Nodemailer)
// For production, use a dedicated email service like SendGrid, Mailgun, etc.
// Store your email service credentials securely in Firebase environment config:
// firebase functions:config:set mail.email="YOUR_EMAIL@gmail.com" mail.password="YOUR_APP_PASSWORD"
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: functions.config().mail.email, // Your Gmail email
        pass: functions.config().mail.password // Your Gmail App Password (NOT your regular password)
    }
});

// Cloud Function to send welcome email upon new user data creation in Realtime Database
exports.sendWelcomeEmail = functions.database.ref('/users/{uid}')
    .onCreate(async (snapshot, context) => {
        const userData = snapshot.val();
        const email = userData.email;
        const username = userData.generatedUsername;
        const password = userData.generatedPassword;
        const downloadLink = "YOUR_APP_DOWNLOAD_LINK_HERE"; // Replace with your App Inventor APK link

        if (!email || !username || !password) {
            console.warn("Missing email, username, or password for welcome email.");
            return null;
        }

        const mailOptions = {
            from: `"VideoFire App" <${functions.config().mail.email}>`, // Sender address
            to: email,                                                 // List of recipients
            subject: 'Welcome to VideoFire! Your Login Credentials',   // Subject line
            html: `
                <p>Hello ${userData.displayName || username},</p>
                <p>Welcome to VideoFire! Here are your login details:</p>
                <p><strong>Username:</strong> ${username}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p>Please use these credentials to log in on the VideoFire app.</p>
                <p>Download the app here: <a href="${downloadLink}">${downloadLink}</a></p>
                <p>Thank you for joining!</p>
                <p>The VideoFire Team</p>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Welcome email sent successfully to:', email);
            return null;
        } catch (error) {
            console.error('Error sending welcome email to', email, ':', error);
            return null;
        }
    });

// To deploy this function:
// 1. Make sure you have Node.js and npm installed.
// 2. Install Firebase CLI: npm install -g firebase-tools
// 3. In your Firebase project folder, run: firebase init functions
// 4. Copy this code into functions/index.js
// 5. Install nodemailer in functions folder: cd functions && npm install nodemailer
// 6. Set environment config for email: firebase functions:config:set mail.email="YOUR_EMAIL@gmail.com" mail.password="YOUR_APP_PASSWORD"
//    (Replace YOUR_APP_PASSWORD with an App Password generated for your Gmail, not your main password)
// 7. Deploy: firebase deploy --only functions
