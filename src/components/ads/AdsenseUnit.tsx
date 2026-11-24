"use client";

import { useEffect, useRef } from "react";

/** A responsive Google AdSense unit. The AdSense script itself is added once by the site layout. */
export function AdsenseUnit({ client, slot }: { client: string; slot: string }) {
  const pushed = useRef(false);
  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      // Blocked by an ad blocker: leave the space empty.
    }
  }, []);
  return (
    <ins
      className="adsbygoogle block"
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
