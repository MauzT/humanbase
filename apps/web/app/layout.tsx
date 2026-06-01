import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Humanbase",
  description: "A date-first personal notes timeline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
