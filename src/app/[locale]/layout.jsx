import { Inter, Cairo } from "next/font/google";
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
const cairo = Cairo({ subsets: ["arabic"] });

export const metadata = {
  title: "BlazingTorrent | Private Business Exchange for Stanford Seed Alumni",
  description: "BlazingTorrent is a private, verified platform for Stanford Seed alumni to discover curated opportunities, exchange market intelligence, and build strategic partnerships across Africa.",
};

export default async function RootLayout({ children, params }) {
  // 1. Await the params before accessing properties
  const { locale } = await params;

  // 2. Now 'locale' will be defined (e.g., "en" or "fr" or "ar")
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // Load messages for this locale
  const messages = (await import(`../../messages/${locale}.json`)).default;
  const isRtl = locale === 'ar';
  const fontClass = isRtl ? cairo.className : inter.className;
  const dir = isRtl ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={fontClass}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <QueryProvider>
              

              <Toaster position="bottom-right" />
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
