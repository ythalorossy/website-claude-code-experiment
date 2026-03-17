import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkContactRateLimit } from '@/lib/rate-limit';

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

  // In a real application, you would:
  // 1. Send an email notification
  // 2. Store the contact submission in the database

  // For now, we'll just return success
  return NextResponse.json(
    { message: 'Message sent successfully!' },
    { status: 200 }
  );
}