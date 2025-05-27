import type { Metadata } from 'next';
import { Geist, Geist_Mono, Bahiana } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { InfoDialog } from '@/components/pup-match/info-dialog';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const bahiana = Bahiana({
  variable: '--font-bahiana',
  weight: '400', // Bahiana Regular
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Tinder for Dogs - Find Your Canine Companion',
  description: 'The paw-fect place to find your next furry friend. It\'s like Tinder, but for dogs!',
  icons: '/favicon.png',
};

export default function RootLayout({
  children,
  params,
  searchParams,
}: Readonly<{
  children: React.ReactNode;
  params: { [key: string]: string | string[] | undefined };
  searchParams?: { [key: string]: string | string[] | undefined };
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${bahiana.variable} antialiased font-sans bg-background text-foreground`}>
        <div className="relative min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container relative flex h-12 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
              {/* Left side - empty for balance */}
              <div className="w-12"></div>
              
              {/* Center - Logo */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative h-12 w-12 overflow-hidden">
                  <img 
                    src="/logo.png" 
                    alt="Tinder for Dogs Logo" 
                    className="absolute -inset-1 -inset-y-2 h-[140%] w-[140%] object-contain hover:scale-110 transition-transform duration-200"
                  />
                </div>
              </div>

              {/* Right side - Info button */}
              <InfoDialog>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Information</span>
                </Button>
              </InfoDialog>
            </div>
          </header>
          <main className="flex-grow">
           {children}
          </main>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
