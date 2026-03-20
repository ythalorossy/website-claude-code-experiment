import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkContactRateLimit } from '@/lib/rate-limit';
import { sendContactEmail } from '@/lib/email';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? request.headers.get('x-real-ip') ?? 'unknown';
  const rateLimit = await checkContactRateLimit(ip);
  if (!rateLimit.success) {
    return NextResponse.json(
      { message: rateLimit.message },
      { status: 429 }
    );
  }

  const body = await request.json();
  const validatedFields = contactSchema.safeParse(body);

  if (!validatedFields.success) {
    return NextResponse.json(
      { message: 'Invalid input', errors: validatedFields.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    await sendContactEmail({
      name: validatedFields.data.name,
      email: validatedFields.data.email,
      message: validatedFields.data.message,
    });
  } catch (error) {
    console.error('Failed to send contact email:', error);
    return NextResponse.json(
      { message: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: 'Message sent successfully!' },
    { status: 200 }
  );
}