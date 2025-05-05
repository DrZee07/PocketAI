// Markdown parsing utilities
import { marked } from "marked"

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false,
})

// Parse markdown to HTML
export function parseMarkdown(markdown: string): string {
  try {
    return marked.parse(markdown)
  } catch (error) {
    console.error("Error parsing markdown:", error)
    return markdown
  }
}

// Sanitize HTML to prevent XSS attacks
export function sanitizeHtml(html: string): string {
  // This is a very basic sanitization
  // In a production app, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/g, "")
    .replace(/javascript:/g, "")
}

// Convert HTML to plain text
export function htmlToText(html: string): string {
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = html
  return tempDiv.textContent || tempDiv.innerText || ""
}

// Process markdown content for display
export function processContent(content: string, enableMarkdown = true): string {
  if (!enableMarkdown) return content

  const html = parseMarkdown(content)
  return sanitizeHtml(html)
}
