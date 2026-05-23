import type { Metadata } from "next";
import { Noto_Serif_JP, Cinzel, Geist_Mono } from "next/font/google";
import "./globals.css";

const notoSerifJp = Noto_Serif_JP({
  variable: "--font-serif-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sunyata | 禅風ミニマルRPG 公式特設サイト",
  description: "一撃で、すべてを削ぎ落とすRPG。極限まで削ぎ落とされた、静寂と対話する旅。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSerifJp.variable} ${cinzel.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-black dark:bg-[#0a0a0a] dark:text-[#f3f3f3] transition-colors duration-500 selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900">
        {children}
      </body>
    </html>
  );
}
