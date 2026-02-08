import type { Metadata } from "next";
import { UserProvider } from '@auth0/nextjs-auth0/client';
import WalletProvider from '@/solana_module/components/WalletProvider';
import "./globals.css";

export const metadata: Metadata = {
  title: "Ditto!",
  description: "Create your AI-powered digital twin that lives forever",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <UserProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </UserProvider>
      </body>
    </html>
  );
}
