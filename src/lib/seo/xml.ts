// Helpers for the hand-built XML routes (RSS feed, news sitemap).

const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };

/** Escapes text for an XML element or attribute. */
export function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => entities[char]);
}

/** An XML response; crawlers may cache it briefly so bursts don't hit the database. */
export function xmlResponse(body: string, contentType = "application/xml") {
  return new Response(body, {
    headers: {
      "Content-Type": `${contentType}; charset=utf-8`,
      "Cache-Control": "public, max-age=0, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}
