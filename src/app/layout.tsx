import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mind Refill | Professional Psychological Care & Therapy",
  description:
    "Mind Refill connects individuals seeking mental well-being and psychological support with verified psychologists and human coordinators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-serene-50 text-serene-900 selection:bg-brand-100 selection:text-brand-900">
        {children}
      </body>
    </html>
  );
}
