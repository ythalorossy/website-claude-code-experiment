import { PrismaClient, Role, PostStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCoins() {
  const coins = [
    { symbol: 'BTC', name: 'Bitcoin',   coincapId: 'bitcoin',  color: '#f7931a' },
    { symbol: 'ETH', name: 'Ethereum',  coincapId: 'ethereum', color: '#627eea' },
    { symbol: 'SOL', name: 'Solana',    coincapId: 'solana',   color: '#14f195' },
    { symbol: 'DOGE', name: 'Dogecoin', coincapId: 'dogecoin', color: '#e84142' },
  ];

  for (const coin of coins) {
    await prisma.coin.upsert({
      where: { symbol: coin.symbol },
      update: coin,
      create: coin,
    });
  }
  console.log(`Seeded ${coins.length} coins`);
}

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  await seedCoins();

  // Create demo posts
  const posts = [
    {
      title: 'Welcome to Our Blog',
      slug: 'welcome-to-our-blog',
      content: `# Welcome to Our Blog

This is our first blog post built with Next.js and MDX.

## Features

- **Rich text formatting** with Markdown
- **Code syntax highlighting** with Shiki
- **Dark mode** support
- And much more...

## Code Example

\`\`\`typescript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

## Getting Started

To get started with this blog, simply clone the repository and follow the setup instructions in the README.

Happy coding!`,
      excerpt: 'Welcome to our new blog built with Next.js and MDX. Discover the features and capabilities of our modern content platform.',
      status: PostStatus.PUBLISHED,
      tags: ['welcome', 'introduction', 'nextjs'],
      authorId: admin.id,
      publishedAt: new Date(),
    },
    {
      title: 'Building a Modern CMS with Next.js',
      slug: 'building-modern-cms-nextjs',
      content: `# Building a Modern CMS with Next.js

In this post, we'll explore how to build a content management system using Next.js 14, Prisma, and PostgreSQL.

## Architecture Overview

Our CMS architecture consists of:

1. **Frontend**: Next.js 14 with App Router
2. **Database**: PostgreSQL with Prisma ORM
3. **Authentication**: NextAuth.js with OAuth
4. **Content**: MDX for rich content

## Key Features

- **Role-based access control** (Admin/User)
- **Optimistic UI** for better UX
- **Server Actions** for form handling
- **Type-safe** database queries

## Conclusion

Building a modern CMS has never been easier with Next.js 14 and the App Router.`,
      excerpt: 'Learn how to build a modern content management system using Next.js 14, Prisma, and PostgreSQL.',
      status: PostStatus.PUBLISHED,
      tags: ['tutorial', 'nextjs', 'cms', 'prisma'],
      authorId: admin.id,
      publishedAt: new Date(Date.now() - 86400000),
    },
    {
      title: 'Understanding Server Components in Next.js',
      slug: 'understanding-server-components',
      content: `# Understanding Server Components in Next.js

Server Components are a game-changer in Next.js 14. Let's dive deep into how they work.

## What are Server Components?

Server Components are React components that render on the server. They allow you to:
- Access backend resources directly
- Keep sensitive logic on the server
- Reduce client-side JavaScript

## When to Use Server Components

- Fetching data from databases
- Accessing backend resources
- Keeping sensitive information secure

## When to Use Client Components

- Interactive UI (onClick, onChange)
- Using browser APIs
- Managing client-side state

## Best Practices

1. Default to Server Components
2. Use 'use client' only when necessary
3. Keep client components small and isolated`,
      excerpt: 'A deep dive into Server Components in Next.js 14 and when to use them.',
      status: PostStatus.DRAFT,
      tags: ['nextjs', 'react', 'server-components'],
      authorId: admin.id,
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  console.log('Database seeded successfully!');
  console.log(`Created ${posts.length} posts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });