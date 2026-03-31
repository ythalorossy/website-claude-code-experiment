import { Metadata } from 'next';
import { Target, Lightbulb, Code2, Heart, Zap, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about us',
};

const values = [
  { icon: Heart, label: 'Quality over quantity', desc: 'We prioritize depth and substance in everything we create' },
  { icon: Users, label: 'Accessibility for all', desc: 'Building inclusive experiences that work for everyone' },
  { icon: Zap, label: 'Performance & speed', desc: 'Blazing-fast load times and smooth interactions' },
  { icon: Target, label: 'Continuous improvement', desc: 'Always learning, evolving, and pushing boundaries' },
];

const features = [
  {
    icon: Target,
    title: 'Our Mission',
    description:
      'Our mission is to create a modern, accessible, and performant web experience that serves our community with valuable content and resources.',
  },
  {
    icon: Lightbulb,
    title: 'What We Do',
    description:
      'We publish articles on technology, development, and best practices. Our team works hard to bring you the latest insights and tutorials.',
  },
  {
    icon: Code2,
    title: 'How We Build',
    description:
      'Built with Next.js, PostgreSQL, and Tailwind CSS. Open source at heart, we believe in transparency and collaboration.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-fuchsia-50 to-transparent py-20 dark:from-violet-950/20 dark:via-fuchsia-950/20 dark:to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-200/40 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-400 md:text-6xl">
              About Us
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-400">
              We are dedicated to providing high-quality content and excellent service to our users.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-violet-200 hover:shadow-lg dark:border-gray-800 dark:bg-slate-900 dark:hover:border-violet-800/50"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 transition-transform duration-300 group-hover:scale-110">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Our Values</h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                The principles that guide everything we do
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div
                  key={value.label}
                  className="group rounded-xl border border-gray-200 bg-white p-6 text-center transition-all duration-300 hover:border-cyan-200 hover:shadow-md dark:border-gray-800 dark:bg-slate-900 dark:hover:border-cyan-800/50"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 transition-colors duration-300 group-hover:bg-cyan-500 group-hover:text-white dark:bg-cyan-900/50 dark:text-cyan-400">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">{value.label}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-10 text-center text-white shadow-xl">
              <h2 className="text-2xl font-bold md:text-3xl">Get in Touch</h2>
              <p className="mt-4 text-violet-100">
                Have questions or want to collaborate? We&apos;d love to hear from you.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-violet-600 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-violet-50"
              >
                Contact Us
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}