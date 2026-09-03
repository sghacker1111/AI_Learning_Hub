import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Guru AI — Nepal Class 1–12 Learning Hub",
  description:
    "A Nepal Class 1–12 learning hub with curriculum-grounded AI tutoring, voice teaching, practice, and teacher tools in English and Nepali.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
  },
  keywords: [
    "AI Learning Nepal",
    "Nepal CDC Curriculum",
    "Class 1 to 12 Nepal",
    "Voice AI Tutor Nepal",
    "Nepali EdTech",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ServiceWorkerRegistration />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
