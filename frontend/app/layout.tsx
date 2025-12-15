import type { Metadata } from "next";
import "./globals.css";
import Providers from '@/components/Providers';
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Knowledge Graph Editor",
  description: "A collaborative knowledge graph editor with nested groups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <ErrorBoundary>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
