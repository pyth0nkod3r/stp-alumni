import { Inter } from "next/font/google";
import ".././globals.css";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/Footer";
import Navbar from "@/components/(hero-nav)/Navbar";
import { NavbarProvider } from "@/contexts/NavbarContext";
import QueryProvider from "@/lib/providers/QueryProvider";
import { AuthProvider } from "@/lib/hooks/useUser";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Blazing Torrent Alumni Network",
  description: "Connect, collaborate, and grow with the Blazing Torrent alumni community. Discover opportunities, share insights, and build lasting relationships with fellow graduates and professionals.",
};

export default async function RootLayout({ children, params }) {
  // 1. Await the params before accessing properties
  const { locale } = await params;

  // 2. Now 'locale' will be defined (e.g., "en" or "fr")
  // console.log(locale, "locale detected");
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // Load messages for this locale so /fr shows French regardless of getRequestConfig
  const messages = (await import(`../../messages/${locale}.json`)).default;
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <QueryProvider>
              

              <Toaster position="center" />
              <AuthProvider>

              <NavbarProvider>
                {/* <Navbar /> */}
                <div className="min-h-screen bg-background">{children}</div>
                {/* <Footer /> */}
              </NavbarProvider>
              </AuthProvider>
            </QueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
