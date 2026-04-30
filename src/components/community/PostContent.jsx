import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

// Detects if content is HTML (contains HTML tags like <h2>, <p>, <strong>, etc.)
function isHtmlContent(text) {
  if (!text) return false;
  // Check for common HTML patterns
  return /<(h[1-6]|p|div|strong|em|ul|ol|li|blockquote|br|hr|table|tr|td|th|span|a|img|head|body|html|!DOCTYPE)\b/i.test(text);
}

// Strips full HTML document wrapper (<!DOCTYPE>, <html>, <head>, <style>, <body>) 
// and returns just the body content
function extractBodyContent(html) {
  if (!html) return '';
  
  // Remove ```html and ``` code fences
  let cleaned = html.replace(/^```html?\s*/i, '').replace(/```\s*$/, '').trim();
  
  // If it has a <body> tag, extract just body content
  const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    cleaned = bodyMatch[1].trim();
  } else {
    // Remove <!DOCTYPE>, <html>, </html>, <head>...</head> if present
    cleaned = cleaned
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<\/?html[^>]*>/gi, '')
      .replace(/<head[\s\S]*?<\/head>/gi, '')
      .replace(/<\/?body[^>]*>/gi, '')
      .trim();
  }
  
  return cleaned;
}

// Highlights all occurrences of query in text with a yellow background
function highlightText(text, query) {
  if (!query || !text) return text;
  const q = query.trim();
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part}</mark> : part
  );
}

// For HTML content, inject <mark> tags around matches
function highlightHtml(html, query) {
  if (!query || !html) return html;
  const q = query.trim();
  if (!q) return html;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Only highlight text content, not inside HTML tags
  return html.replace(new RegExp(`(?<=>)([^<]*?)(?=<)`, 'g'), (segment) => {
    return segment.replace(new RegExp(`(${escaped})`, 'gi'), '<mark style="background:#fef08a;color:#713f12;border-radius:2px;padding:0 2px">$1</mark>');
  });
}

export default function PostContent({ content, highlightQuery }) {
  const { isHtml, displayContent } = useMemo(() => {
    if (!content) return { isHtml: false, displayContent: '' };
    
    const html = isHtmlContent(content);
    if (html) {
      return { isHtml: true, displayContent: extractBodyContent(content) };
    }
    return { isHtml: false, displayContent: content };
  }, [content]);

  if (!content) return null;

  if (isHtml) {
    const finalHtml = highlightQuery ? highlightHtml(displayContent, highlightQuery) : displayContent;
    return (
      <div 
        className="text-sm text-slate-700 leading-relaxed prose prose-sm prose-slate max-w-none
          [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2
          [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-violet-800
          [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5
          [&_p]:my-2 [&_p]:leading-relaxed
          [&_ul]:my-2 [&_ul]:pl-5 [&_ul]:list-disc
          [&_ol]:my-2 [&_ol]:pl-5 [&_ol]:list-decimal
          [&_li]:my-1
          [&_strong]:font-bold
          [&_em]:italic
          [&_blockquote]:border-l-4 [&_blockquote]:border-violet-300 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-3 [&_blockquote]:bg-violet-50/50 [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_blockquote]:text-slate-600
          [&_hr]:my-4 [&_hr]:border-slate-200
          [&_a]:text-violet-600 [&_a]:underline [&_a]:hover:text-violet-800"
        dangerouslySetInnerHTML={{ __html: finalHtml }} 
      />
    );
  }

  // For plain text / markdown with highlighting
  if (highlightQuery?.trim()) {
    // Render as highlighted plain text (skip markdown to preserve highlight marks)
    return (
      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
        {highlightText(content, highlightQuery)}
      </div>
    );
  }

  return (
    <div className="text-sm text-slate-700 leading-relaxed prose prose-sm prose-slate max-w-none
      [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
      [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1
      [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1
      [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1
      [&_p]:my-1.5 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5
      [&_blockquote]:border-l-2 [&_blockquote]:border-violet-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-500
      [&_hr]:my-3 [&_hr]:border-slate-200">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}