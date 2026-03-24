import type { Metadata } from 'next';
import {
  Outfit,
  Sora,
  Caveat,
  Playfair_Display,
  Poppins,
  Cormorant_Garamond,
  Jost,
  Unbounded,
  Inter_Tight,
} from 'next/font/google';
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

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair-display',
  subsets: ['latin'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-cormorant-garamond',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
});

const unbounded = Unbounded({
  variable: '--font-unbounded',
  subsets: ['latin'],
});

const interTight = Inter_Tight({
  variable: '--font-inter-tight',
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
      data-scroll-behavior="smooth"
      className={`${outfit.variable} ${sora.variable} ${caveat.variable} ${playfairDisplay.variable} ${poppins.variable} ${cormorantGaramond.variable} ${jost.variable} ${unbounded.variable} ${interTight.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ApolloProvider>
          <AuthProvider>{children}</AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
