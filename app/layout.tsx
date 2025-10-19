import type { Metadata } from "next";
import "@/styles/globals.scss";
import "@/styles/partials/_themes.scss";

export const metadata: Metadata = {
  title: "GeoQuiz",
  description: "A quiz on the countries of the world",
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
