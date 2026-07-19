import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Questling — Study worlds from your notes",
  description: "Turn PDFs into source-grounded study adventures.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
