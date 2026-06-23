import { redirect } from 'next/navigation';
import { sendClickNotification } from '@/lib/email';

const ALLOWED_HOSTS = new Set(['amazon.com', 'www.amazon.com']);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dest = searchParams.get('dest');
  const title = searchParams.get('title') ?? 'Unknown product';
  const storeId = searchParams.get('store') ?? 'unknown';

  if (!dest) {
    return new Response('Missing dest', { status: 400 });
  }

  // Validate destination to prevent open redirect abuse
  let destUrl: URL;
  try {
    destUrl = new URL(dest);
  } catch {
    return new Response('Invalid dest', { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(destUrl.hostname)) {
    return new Response('Destination not allowed', { status: 400 });
  }

  // Fire-and-forget — don't block the redirect on email delivery
  sendClickNotification({ productTitle: title, storeId, destUrl: dest }).catch(() => {});

  redirect(dest);
}
