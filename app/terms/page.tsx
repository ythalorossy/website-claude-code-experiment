import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Our terms of service',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 md:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>
        <div className="prose prose-lg dark:prose-invert">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using this website, you accept and agree to be bound by the
            terms and provision of this agreement.
          </p>

          <h2>Use License</h2>
          <p>
            Permission is granted to temporarily use this website for personal, non-commercial
            use only.
          </p>

          <h2>Restrictions</h2>
          <p>You are prohibited from:</p>
          <ul>
            <li>Using this website for any unlawful purpose</li>
            <li>Violating any applicable regulations</li>
            <li>Interfering with the proper working of the website</li>
          </ul>

          <h2>Disclaimer</h2>
          <p>
            This website is provided "as is". We make no representations or warranties of any
            kind.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            We shall not be liable for any indirect, incidental, or consequential damages
            arising out of your use of this website.
          </p>

          <h2>Contact Us</h2>
          <p>If you have any questions about these Terms of Service, please contact us.</p>
        </div>
      </div>
    </div>
  );
}