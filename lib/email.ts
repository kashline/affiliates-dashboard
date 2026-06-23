import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendClickNotification({
  productTitle,
  storeId,
  destUrl,
}: {
  productTitle: string;
  storeId: string;
  destUrl: string;
}) {
  const to = process.env.NOTIFICATION_EMAIL;
  if (!to) return; // silently skip if not configured

  await resend.emails.send({
    from: process.env.NOTIFICATION_FROM_EMAIL ?? 'Affiliates <onboarding@resend.dev>',
    to,
    subject: `Click: ${productTitle}`,
    text: [
      `Someone clicked an affiliate link on your storefront.`,
      ``,
      `Product: ${productTitle}`,
      `Store:   ${storeId}`,
      `Link:    ${destUrl}`,
      `Time:    ${new Date().toUTCString()}`,
    ].join('\n'),
  });
}
