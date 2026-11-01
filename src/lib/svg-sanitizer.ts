/**
 * Validates and sanitizes SVG contents to protect against stored XSS, XXE, and script injection.
 */
export function isSafeSvg(svgContent: string): {
  safe: boolean;
  reason?: string;
} {
  const contentLower = svgContent.toLowerCase();

  // Block XXE / Entity injection
  if (contentLower.includes("<!entity") || contentLower.includes("<!doctype")) {
    return {
      safe: false,
      reason: "يحتوي ملف SVG على تعريفات DTD أو Entity غير مسموح بها لأسباب أمنية.",
    };
  }

  // Block Script tags
  if (/<script[\s\S]*?>/i.test(svgContent)) {
    return {
      safe: false,
      reason: "يحتوي ملف SVG على وسوم برمجية <script> غير مصرح بها.",
    };
  }

  // Block event handlers (onload, onerror, onclick, onmouseover, etc.)
  if (/\son[a-z]{3,}\s*=/i.test(svgContent)) {
    return {
      safe: false,
      reason: "يحتوي ملف SVG على معالجات أحداث تنفيذية (Event Handlers) محظورة.",
    };
  }

  // Block javascript: or data: URI execution
  if (
    /href\s*=\s*["']?\s*(javascript|data:text\/html)/i.test(svgContent) ||
    /xlink:href\s*=\s*["']?\s*(javascript|data:text\/html)/i.test(svgContent)
  ) {
    return {
      safe: false,
      reason: "يحتوي ملف SVG على روابط javascript: غير آمنة.",
    };
  }

  // Block foreignObject / iframe / embed / object
  if (
    /<(foreignobject|iframe|embed|object|applet)[\s\S]*?>/i.test(svgContent)
  ) {
    return {
      safe: false,
      reason: "يحتوي ملف SVG على عناصر مضمنة (embedded objects) محظورة.",
    };
  }

  // Must contain an <svg tag
  if (!/<svg[\s\S]*?>/i.test(svgContent)) {
    return {
      safe: false,
      reason: "الملف لا يحتوي على وسم <svg> صالح.",
    };
  }

  return { safe: true };
}

