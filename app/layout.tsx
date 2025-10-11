import type { Metadata } from "next";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Quick Time",
  description: "Simple Minute Based Timer",
  viewport: "width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </head>
      <body>{children}</body>
    </html>
  );
}
