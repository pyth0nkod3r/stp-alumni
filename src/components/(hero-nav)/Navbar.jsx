"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/routing"; // This is the specialized Link
import { useTranslations } from "next-intl";
import { ModeToggle } from "../ModeToggle";
import LanguageSwitcher from "../LanguageSwitcher";
import Container from "../container";
import { useSize } from "react-haiku";
import { useNavbar } from "@/contexts/NavbarContext";
import { useAuth } from "@/lib/hooks/useUser";

const Navbar = () => {
  const t = useTranslations("Navbar");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const elementRef = useRef(null);
  const { width, height } = useSize(elementRef);

  const { setSize } = useNavbar();

  useEffect(() => {
    setSize({ width, height });
  }, [width, height]);

  // console.log("Navbar size:", { width, height });

  const pathname = usePathname();

  const isPublicPage = ["/marketplace", "/events", "/contact"].includes(
    pathname,
  );

  // console.log("Current pathname:", isPublicPage);

  // Using translation keys for the labels
  const navLinks = [
    { label: t("market"), href: "/marketplace" },
    { label: t("events"), href: "/events" },
    { label: t("about"), href: "/about" },
    { label: t("contact"), href: "/contact" },
  ];

  const { data } = useAuth();

  const isAuth = data?.userId || null;

  console.log(isAuth,"isAuth")

  const [isScrolled, setIsScrolled] = useState(false);

  const useDarkText = isScrolled || isPublicPage;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    // <nav className="fixed top-0 left-0 right-0 z-50 ">
    <nav
      ref={elementRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/70 dark:bg-[#0A192F]/60 backdrop-blur-xl border-b border-black/5 py-2 shadow-sm"
          : isPublicPage
            ? "bg-white dark:bg-[#0A192F] py-2 border-b"
            : "bg-transparent py-4"
      }`}
    >
      <Container className="flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/logo-removebg-preview.png"
            alt="STP Alumni"
            width={240}
            height={50}
            className="object-contain h-[62px] w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-300 ${
                useDarkText
                  ? "text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-white"
                  : "text-white/90 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            size="sm"
            className={`border rounded-sm p-3.75 transition-all duration-300 ${
              useDarkText
                ? "border-slate-200 text-slate-900 hover:bg-slate-100 dark:border-blue-500 dark:text-blue-500"
                : "border-white text-white hover:bg-white/10"
            }`}
            asChild
          >
           {isAuth ? <Link href={"/dashboard"}>{t("dashboard")}</Link> : <Link href="/login">{t("login")}</Link>}
          </Button>

          <ModeToggle />
          <LanguageSwitcher />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`md:hidden transition-colors ${useDarkText ? "text-slate-900 dark:text-white" : "text-white"}`}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </Container>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-border bg-background/95 md:hidden">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex flex-col gap-2 pt-4">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-red-500"
                  asChild
                >
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t("login")}
                  </Link>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t("login")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
