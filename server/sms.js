import dotenv from 'dotenv';
// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function sendOTP(phone) {
  const otp = Math.floor(100000 + Math.random() * 900000);
  client.messages
    .create({
      body: `Your OTP is ${otp}`,
      from: '+16078004729',
      to: `${phone}`,
    })
    .then((message) => console.log(message.sid));
}
