import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import Anthropic from '@anthropic-ai/sdk';

const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
});

const anthropic = new Anthropic({
  apiKey: process.env.MINIMAX_API_KEY!,
  baseURL: 'https://api.minimax.io/anthropic',
});

export async function POST(request: NextRequest) {
  if (process.env.ENABLE_CHAT !== 'true') {
    return NextResponse.json({ message: 'Chat is disabled' }, { status: 403 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? request.headers.get('x-real-ip') ?? 'unknown';
  const rateLimit = await checkRateLimit(`chat:${ip}`);
  if (!rateLimit.success) {
    return NextResponse.json(
      { message: rateLimit.message },
      { status: 429 }
    );
  }

  const body = await request.json();
  const validatedFields = chatSchema.safeParse(body);

  if (!validatedFields.success) {
    return NextResponse.json(
      { message: 'Invalid input', errors: validatedFields.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { message } = validatedFields.data;

  try {
    const msg = await anthropic.messages.create({
      model: 'MiniMax-M2.7',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const response = msg.content[0];
    if (response.type === 'text') {
      return NextResponse.json({ message: response.text });
    } else {
      return NextResponse.json({ message: 'Unable to process response' }, { status: 500 });
    }
  } catch (error) {
    console.error('Minimax API error:', error);
    return NextResponse.json(
      { message: 'Failed to get response. Please try again.' },
      { status: 500 }
    );
  }
}
