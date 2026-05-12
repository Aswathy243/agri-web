import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
sgMail.setApiKey(process.env.SENDGRID_KEY);
const tw = twilio(process.env.TW_SID, process.env.TW_TOKEN);

export async function sendAlerts(farmer, advisories) {
  const body = advisories.map(a=>`• ${a.title}: ${a.text}`).join('\n\n');
  if (farmer.preferences.email) {
    await sgMail.send({ to: farmer.email, from: process.env.EMAIL_FROM, subject: 'Farm Update', text: body });
  }
  if (farmer.preferences.sms) {
    await tw.messages.create({ body, from: process.env.TW_NUM, to: farmer.phone });
  }
}
