import type { Metadata } from "next";
import "./globals.css";
import Providers from '@/components/Providers';

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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
