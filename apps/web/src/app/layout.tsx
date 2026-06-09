import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: "Human Manual — Because people don't come with instruction manuals.",
  description: 'Create your interactive personal manual. Share who you are, how you work, and what makes you, you.',
  keywords: ['personal manual', 'team culture', 'employee handbook', 'personality profile'],
  openGraph: {
    title: 'Human Manual',
    description: 'Create your interactive personal manual.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-base text-slate-100 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
