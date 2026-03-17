import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about us',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 md:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold">About Us</h1>
        <div className="prose prose-lg dark:prose-invert">
          <p>
            Welcome to our website! We are dedicated to providing high-quality content and
            excellent service to our users.
          </p>
          <h2>Our Mission</h2>
          <p>
            Our mission is to create a modern, accessible, and performant web experience that
            serves our community with valuable content and resources.
          </p>
          <h2>What We Do</h2>
          <p>
            We publish articles on technology, development, and best practices. Our team works
            hard to bring you the latest insights and tutorials.
          </p>
          <h2>Our Values</h2>
          <ul>
            <li>Quality over quantity</li>
            <li>Accessibility for all users</li>
            <li>Performance and speed</li>
            <li>Continuous improvement</li>
          </ul>
          <h2>Contact</h2>
          <p>
            If you have any questions or would like to get in touch, please visit our{' '}
            <a href="/contact">contact page</a>.
          </p>
        </div>
      </div>
    </div>
  );
}