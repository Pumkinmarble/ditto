import "./globals.css";

export const metadata = {
  title: "Echo Voice Module",
  description: "Standalone voice cloning + TTS demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
