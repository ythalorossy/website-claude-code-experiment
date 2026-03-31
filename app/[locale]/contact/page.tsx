'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Mail, MapPin, Clock, Send, Twitter, Github, Linkedin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'hello@ysdev.io', href: 'mailto:hello@ysdev.io' },
  { icon: MapPin, label: 'Location', value: 'San Francisco, CA' },
  { icon: Clock, label: 'Response Time', value: 'Usually within 24 hours' },
];

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactFormData) {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitResult({ success: true, message: 'Message sent successfully!' });
        reset();
      } else {
        const result = await response.json();
        setSubmitResult({ success: false, message: result.message || 'Failed to send message' });
      }
    } catch {
      setSubmitResult({ success: false, message: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-fuchsia-50 to-transparent py-20 dark:from-violet-950/20 dark:via-fuchsia-950/20 dark:to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-200/40 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-400 md:text-6xl">
              Contact Us
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-400">
              Get in touch with us. We&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-3">
            {/* Contact Info Column */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Get in Touch</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Have questions or want to collaborate? Fill out the form and we&apos;ll get back to you as soon as possible.
              </p>

              <div className="space-y-4">
                {contactInfo.map((info) => (
                  <div
                    key={info.label}
                    className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-slate-900"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                      <info.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{info.label}</p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="font-medium text-gray-900 hover:text-violet-600 dark:text-gray-100 dark:hover:text-violet-400"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="font-medium text-gray-900 dark:text-gray-100">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="pt-4">
                <p className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">Follow us</p>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 dark:border-gray-800 dark:bg-slate-900 dark:text-gray-400 dark:hover:border-violet-800 dark:hover:bg-violet-900/20 dark:hover:text-violet-400"
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-violet-600" />
                    Send a Message
                  </CardTitle>
                  <CardDescription>Fill out the form below and we&apos;ll get back to you.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="contact-form">
                    <div className="grid gap-6 md:grid-cols-2">
                      <Input
                        label="Name"
                        id="name"
                        placeholder="Your name"
                        error={errors.name?.message}
                        data-testid="contact-name-input"
                        {...register('name')}
                      />

                      <Input
                        label="Email"
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        error={errors.email?.message}
                        data-testid="contact-email-input"
                        {...register('email')}
                      />
                    </div>

                    <Textarea
                      label="Message"
                      id="message"
                      placeholder="Tell us what's on your mind..."
                      rows={6}
                      error={errors.message?.message}
                      data-testid="contact-message-input"
                      {...register('message')}
                    />

                    {submitResult && (
                      <div
                        data-testid="contact-result-message"
                        className={`rounded-xl p-4 ${
                          submitResult.success
                            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        {submitResult.message}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto"
                      data-testid="contact-submit-button"
                    >
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          Send Message
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}