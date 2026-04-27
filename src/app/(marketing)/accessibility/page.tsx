import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Accessibility - isUD',
  description: 'Accessibility commitment for thisisUD.com.',
};

export default function AccessibilityPage() {
  return (
    <div className="bg-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
        <div className="max-w-6xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-primary">
            Accessibility
          </h1>

          <div className="mt-7 space-y-3 text-base sm:text-lg leading-relaxed text-slate-700">
            <p>
              thisisUD.com is committed to fully inclusive web design and has made every effort to ensure all pages of the site are as accessible as possible. We are constantly looking to improve our site so that users of all abilities can experience the content we deliver with ease. You can find out more about{' '}
              <Link href="https://www.w3.org/WAI/fundamentals/accessibility-intro/" className="font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-secondary hover:decoration-secondary">
                web accessibility here
              </Link>
              .
            </p>

            <p>
              Please contact us if you experience any difficulty using this website with screen reader software or other technologies so that we can attempt to address any issues in planned future development.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
