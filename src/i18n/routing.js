import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", 'fr', 'ar'],

  // Used when no locale matches
  defaultLocale: 'en',

localeDetection:true 
});

// These are helpers for navigation (Links, redirects, etc.)
export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);