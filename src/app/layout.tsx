import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_TC({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "小信 · Primary 6 tutor",
  description: "Syllabus-bounded Chinese culture tutor for MBC Primary 6 students.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className={`${noto.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
