import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CXC 2026 - AI Personality Avatar",
  description: "Discover your personality with an AI-powered talking avatar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
