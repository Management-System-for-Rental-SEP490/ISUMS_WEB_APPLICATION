/**
 * Contract HTML utilities
 * Ensures saved HTML includes full document with styles (matching TinyMCE editor display)
 */

/** CSS styles matching ContractHtmlEditor content_style - embedded in saved document */
export const CONTRACT_HTML_STYLES = `
  body { font-family: 'Times New Roman', serif; line-height: 1.4; font-size: 14px; }
  h1, h2 { text-align: center; margin: 6px 0; }
  .center { text-align: center; }
  .right { text-align: right; }
  .section-title { font-weight: bold; margin-top: 10px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  td, th { border: 1px solid #000; padding: 6px; vertical-align: top; }
  .no-border td { border: none; padding: 2px 0; }
  .small { font-size: 12px; }
`.trim();

/**
 * Extract body innerHTML from full document or return as-is if body-only
 * @param {string} html - Full HTML or body content
 * @returns {string} Body innerHTML for editor
 */
export function extractBodyFromHtml(html) {
  if (typeof html !== "string" || !html.trim()) return "<p></p>";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const body = doc.body;
    if (body && doc.documentElement?.tagName?.toLowerCase() === "html") {
      return body.innerHTML.trim() || "<p></p>";
    }
    return html.trim();
  } catch {
    return html.trim() || "<p></p>";
  }
}

/**
 * Wrap body HTML in full document with embedded styles (for API save)
 * Ensures saved HTML renders correctly in iframe with same format as editor
 * @param {string} bodyHtml - Body innerHTML from TinyMCE
 * @returns {string} Full HTML document
 */
export function wrapBodyWithFullDocument(bodyHtml) {
  const content = (bodyHtml || "").trim() || "<p></p>";
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hợp đồng thuê nhà</title>
  <style>
    ${CONTRACT_HTML_STYLES}
  </style>
</head>
<body>
${content}
</body>
</html>`;
}
