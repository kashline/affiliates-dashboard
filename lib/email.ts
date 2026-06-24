import { Resend } from 'resend';

// Instantiated lazily: the Resend constructor throws when the API key is unset,
// and module-load must not crash the build/runtime in environments where email
// notifications aren't configured (the app is designed to run without them).
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
  const apiKey = process.env.RESEND_API_KEY;
  if (!to || !apiKey) return; // silently skip if not configured

  const resend = new Resend(apiKey);
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
