import type { Metadata } from 'next';
import { Outfit, Sora, Caveat } from 'next/font/google';
import './globals.css';
import { ApolloProvider } from '../lib/apollo-provider';
import { AuthProvider } from '../lib/auth-context';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
});

const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Momentee — Every couple has a story',
  description:
    'A social network for couples to preserve memories, share love stories, and receive blessings from friends & family.',
  icons: {
    icon: '/momentee_logo/momentee-favicon.svg',
    apple: '/momentee_logo/momentee-icon-512.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${sora.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ApolloProvider>
          <AuthProvider>{children}</AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
