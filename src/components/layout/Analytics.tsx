import Script from "next/script";

// Google Analytics 4 and/or Tag Manager, set under Admin → SEO → Verification &
// Analytics. Rendered only in the public site layout, never in the admin. The
// IDs are format-checked when saved (G-XXXX / GTM-XXXX), so they can be placed
// in the inline snippets safely.

const GA_ID = /^G-[A-Z0-9]{4,20}$/;
const GTM_ID = /^GTM-[A-Z0-9]{4,20}$/;

export function Analytics({ gaId, gtmId }: { gaId: string; gtmId: string }) {
  const ga = GA_ID.test(gaId) ? gaId : null;
  const gtm = GTM_ID.test(gtmId) ? gtmId : null;

  return (
    <>
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      )}
      {gtm && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}
    </>
  );
}
