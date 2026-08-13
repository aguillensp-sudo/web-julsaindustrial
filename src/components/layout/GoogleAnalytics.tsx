"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const GA_ID = "G-DCM6891W8G";

const EXCLUDED_PREFIXES = ["/portal", "/admin"];

export function GoogleAnalytics() {
  const pathname = usePathname();

  if (EXCLUDED_PREFIXES.some((p) => pathname?.startsWith(p))) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
