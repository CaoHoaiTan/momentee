/**
 * Sanitize user-provided CSS to prevent XSS and data exfiltration.
 *
 * Blocks:
 * - HTML tags (prevent breaking out of <style>)
 * - CSS escape sequences that could obfuscate attacks
 * - Dangerous at-rules: @import, @charset
 * - url() function (data exfiltration, remote resource loading)
 * - expression() (IE CSS expressions)
 * - javascript: protocol
 * - -moz-binding (Firefox XSS vector)
 * - behavior: (IE XSS vector)
 */
export function sanitizeCss(css: string): string {
  return (
    css
      // 1. Strip any HTML tags — prevent breaking out of <style>
      .replace(/<[^>]*>/g, '')
      // 2. Decode CSS unicode escapes to catch obfuscation (e.g. \69mport -> import)
      .replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16)),
      )
      // 3. Block dangerous at-rules
      .replace(/@import\b/gi, '/* blocked */')
      .replace(/@charset\b/gi, '/* blocked */')
      // 4. Block url() function
      .replace(/url\s*\(/gi, '/* blocked */(')
      // 5. Block expression() (IE)
      .replace(/expression\s*\(/gi, '/* blocked */(')
      // 6. Block javascript: protocol
      .replace(/javascript\s*:/gi, '/* blocked */')
      // 7. Block -moz-binding (Firefox)
      .replace(/-moz-binding\s*:/gi, '/* blocked */')
      // 8. Block behavior (IE)
      .replace(/behavior\s*:/gi, '/* blocked */')
  );
}
