const express = require('express');
const router = express.Router();

// Mock TwiML generator for incoming calls (Twilio-ready)
router.post('/incoming', (req, res) => {
  res.type('text/xml');
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather numDigits="1" action="/api/ivr/gather" method="POST">
        <Say voice="alice" language="en-IN">Welcome to ShramaSetu IVR. Press 1 for jobs. Press 2 for attendance. Press 3 for wages. Press 4 for insurance. Press 5 for welfare. Press 6 to connect to support.</Say>
    </Gather>
    <Say>We didn't receive any input. Goodbye!</Say>
</Response>`;
  res.send(twiml);
});

// Mock handler for Gather input
router.post('/gather', (req, res) => {
  const digits = req.body.Digits || req.query.Digits;
  res.type('text/xml');
  
  let sayText = "Invalid option.";
  switch (digits) {
      case '1': sayText = "You selected Jobs. An SMS with job details will be sent to you."; break;
      case '2': sayText = "You selected Attendance. Your attendance has been recorded."; break;
      case '3': sayText = "You selected Wages. Your latest wage payment is processed."; break;
      case '4': sayText = "You selected Insurance. Connecting you to an agent."; break;
      case '5': sayText = "You selected Welfare. Connecting you to a support agent."; break;
      case '6': sayText = "Connecting you to Admin Support."; break;
      default: break;
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice" language="en-IN">${sayText}</Say>
</Response>`;
  res.send(twiml);
});

module.exports = router;
