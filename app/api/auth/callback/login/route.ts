import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // If authenticated, redirect based on role
  if (session?.user) {
    const redirectUrl = session.user.role === 'ADMIN' ? '/admin' : '/';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Not authenticated, redirect to sign in
  return NextResponse.redirect(new URL('/auth/signin', request.url));
}
