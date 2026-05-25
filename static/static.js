const express = require('express');
const router = express.Router();


router.get('/privacy-policy',(req, res) => {
  res.send(`
    <html>
      <head>
        <title>Privacy Policy</title>
      </head>
      <body style="font-family: Arial; padding: 40px;">
        <h1>Privacy Policy</h1>

        <p>
          This application uses Meta APIs for testing and webhook integration.
        </p>

        <p>
          We do not sell or share personal user data with third parties.
        </p>

        <p>
          Any information received is used only for app functionality and testing.
        </p>

        <p>
          Contact: your-email@example.com
        </p>
      </body>
    </html>
  `);
})


router.get("/terms", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Terms of Service</title>
      </head>
      <body style="font-family: Arial; padding: 40px;">
        <h1>Terms of Service</h1>

        <p>
          This application is provided for testing and integration purposes.
        </p>

        <p>
          By using this application, you agree that the service is provided "as is"
          without warranties of any kind.
        </p>

        <p>
          The application may be modified or discontinued at any time.
        </p>
      </body>
    </html>
  `);
});

router.get("/data-deletion", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>User Data Deletion</title>
      </head>
      <body style="font-family: Arial; padding: 40px;">
        <h1>User Data Deletion</h1>

        <p>
          If you want your data deleted from our system,
          please send a request to:
        </p>

        <p>
          your-email@example.com
        </p>

        <p>
          Your data will be deleted within 7 business days.
        </p>
      </body>
    </html>
  `);
});


module.exports = router;


