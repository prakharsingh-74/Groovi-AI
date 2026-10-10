import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import type { Metadata } from "next";
import { Figtree } from "next/font/google"
import axios from 'axios';
import Provider from './provider';
import { Toaster } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: "Groovi AI",
  description: "Groovi AI",
};

const figTree = Figtree({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ margin: 0, padding: 0 }} className={figTree.className}>
          <Provider>
            {children}
            <Toaster />
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
