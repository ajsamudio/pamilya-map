import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pamilya Map 🇵🇭",
  description: "Family Philippines trip planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: '100%', background: '#FAF9F6' }}>
      <body style={{ height: '100%', margin: 0, padding: 0, overflow: 'hidden', background: '#FAF9F6' }}>{children}</body>
    </html>
  );
}
