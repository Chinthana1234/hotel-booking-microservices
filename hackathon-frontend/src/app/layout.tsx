import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ReduxProvider } from '@/store/provider';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'The Grand Ceylon Hotels & Resorts',
  description: 'Experience unparalleled luxury inspired by Sri Lankan hospitality. Book your stay at The Grand Ceylon.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-inter bg-slate-950 text-white min-h-screen`}>
        <ReduxProvider>
          <Navbar />
          <main>{children}</main>
        </ReduxProvider>
      </body>
    </html>
  );
}
