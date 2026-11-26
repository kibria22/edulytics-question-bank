/**
 * Clean markdown text by removing/replacing media references
 */
export function cleanMarkdownForDisplay(text: string): string {
  if (!text) return '';
  
  // Replace media:// markdown with [figure] placeholder
  return text.replace(/!\[([^\]]*)\]\(media:\/\/[^)]+\)/g, '[চিত্র/figure]');
}

/**
 * Extract media references from markdown
 */
export function extractMediaReferences(text: string): string[] {
  if (!text) return [];
  
  const mediaRegex = /!\[([^\]]*)\]\((media:\/\/[^)]+)\)/g;
  const matches: string[] = [];
  let match;
  
  while ((match = mediaRegex.exec(text)) !== null) {
    matches.push(match[2]); // The media:// URL
  }
  
  return matches;
}
