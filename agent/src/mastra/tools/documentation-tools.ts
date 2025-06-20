import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { ofetch } from 'ofetch';
import * as cheerio from 'cheerio';

// Constants from the Python implementation
const SEARCH_API_URL = 'https://proxy.search.docs.aws.amazon.com/search';
const RECOMMENDATIONS_API_URL = 'https://contentrecs-api.docs.aws.amazon.com/v1/recommendations';
const DEFAULT_USER_AGENT = 'AWS-Documentation-MCP-Server/1.0';

// Environment configuration
const AWS_DOCUMENTATION_TIMEOUT = parseInt(Bun.env.AWS_DOCUMENTATION_TIMEOUT || '30000');

// Type definitions
interface SearchResult {
  rank_order: number;
  url: string;
  title: string;
  context?: string;
}

interface RecommendationResult {
  url: string;
  title: string;
  context?: string;
}

// Utility function to convert HTML to markdown
function htmlToMarkdown(html: string): string {
  const $ = cheerio.load(html);
  
  // Remove script and style elements
  $('script, style, nav, header, footer, .breadcrumb').remove();
  
  // Convert headings
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const $el = $(el);
    const level = parseInt(el.tagName.substring(1));
    const text = $el.text().trim();
    $el.replaceWith(`\n${'#'.repeat(level)} ${text}\n\n`);
  });
  
  // Convert paragraphs
  $('p').each((_, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    if (text) {
      $el.replaceWith(`${text}\n\n`);
    }
  });
  
  // Convert code blocks
  $('pre code, pre').each((_, el) => {
    const $el = $(el);
    const text = $el.text();
    $el.replaceWith(`\n\`\`\`\n${text}\n\`\`\`\n\n`);
  });
  
  // Convert inline code
  $('code').each((_, el) => {
    const $el = $(el);
    const text = $el.text();
    $el.replaceWith(`\`${text}\``);
  });
  
  // Convert lists
  $('ul, ol').each((_, el) => {
    const $el = $(el);
    const isOrdered = el.tagName.toLowerCase() === 'ol';
    let markdown = '\n';
    
    $el.find('li').each((index, li) => {
      const $li = $(li);
      const text = $li.text().trim();
      const prefix = isOrdered ? `${index + 1}. ` : '- ';
      markdown += `${prefix}${text}\n`;
    });
    
    $el.replaceWith(markdown + '\n');
  });
  
  // Convert links
  $('a').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    const text = $el.text().trim();
    if (href && text) {
      $el.replaceWith(`[${text}](${href})`);
    }
  });
  
  // Convert tables (basic conversion)
  $('table').each((_, el) => {
    const $el = $(el);
    let markdown = '\n';
    
    $el.find('tr').each((rowIndex, tr) => {
      const $tr = $(tr);
      const cells: string[] = [];
      
      $tr.find('th, td').each((_, cell) => {
        cells.push($(cell).text().trim());
      });
      
      if (cells.length > 0) {
        markdown += `| ${cells.join(' | ')} |\n`;
        
        // Add header separator for first row
        if (rowIndex === 0) {
          markdown += `| ${cells.map(() => '---').join(' | ')} |\n`;
        }
      }
    });
    
    $el.replaceWith(markdown + '\n');
  });
  
  // Get the final text and clean it up
  let markdown = $.text();
  
  // Clean up excessive whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.replace(/^\s+|\s+$/g, '');
  
  return markdown;
}

// Utility function to parse recommendation results
function parseRecommendationResults(data: any): RecommendationResult[] {
  const results: RecommendationResult[] = [];
  
  if (data.recommendations) {
    for (const category of Object.values(data.recommendations)) {
      if (Array.isArray(category)) {
        for (const item of category) {
          if (item.url && item.title) {
            results.push({
              url: item.url,
              title: item.title,
              context: item.description || item.summary,
            });
          }
        }
      }
    }
  }
  
  return results;
}

// Error handling utility
function handleDocumentationError(error: any): string {
  if (error.status === 404) {
    return `Documentation page not found: ${error.message}`;
  }
  if (error.status === 403) {
    return `Access denied to documentation: ${error.message}`;
  }
  if (error.status >= 500) {
    return `AWS documentation service error: ${error.message}`;
  }
  if (error.name === 'TimeoutError') {
    return `Request timeout while accessing AWS documentation: ${error.message}`;
  }
  
  return `Documentation error: ${error.message || error}`;
}

// Schema definitions
const ReadDocumentationInputSchema = z.object({
  url: z.string().url().describe('URL of the AWS documentation page to read'),
  max_length: z.number().min(1).max(1000000).default(5000).describe('Maximum number of characters to return'),
  start_index: z.number().min(0).default(0).describe('Starting character index for pagination'),
});

const ReadDocumentationOutputSchema = z.string().describe('Markdown content of the AWS documentation page');

const SearchDocumentationInputSchema = z.object({
  search_phrase: z.string().describe('Search phrase to use'),
  limit: z.number().min(1).max(50).default(10).describe('Maximum number of results to return'),
});

const SearchDocumentationOutputSchema = z.array(z.object({
  rank_order: z.number().describe('Relevance ranking (lower is more relevant)'),
  url: z.string().describe('Documentation page URL'),
  title: z.string().describe('Page title'),
  context: z.string().optional().describe('Brief excerpt or summary'),
})).describe('List of search results');

const RecommendInputSchema = z.object({
  url: z.string().url().describe('URL of the AWS documentation page to get recommendations for'),
});

const RecommendOutputSchema = z.array(z.object({
  url: z.string().describe('Documentation page URL'),
  title: z.string().describe('Page title'),
  context: z.string().optional().describe('Brief description'),
})).describe('List of recommended pages');

// Read Documentation Tool
const readDocumentationTool = createTool({
  id: 'read_documentation',
  description: 'Fetch and convert an AWS documentation page to markdown format. Supports pagination for long documents.',
  inputSchema: ReadDocumentationInputSchema,
  outputSchema: ReadDocumentationOutputSchema,
  execute: async ({ context }) => {
    const { url, max_length, start_index } = context;

    // Validate URL is from docs.aws.amazon.com and ends with .html
    if (!url.match(/^https?:\/\/docs\.aws\.amazon\.com\//)) {
      throw new Error('URL must be from the docs.aws.amazon.com domain');
    }
    if (!url.endsWith('.html')) {
      throw new Error('URL must end with .html');
    }

    try {
      const response = await ofetch(url, {
        headers: {
          'User-Agent': DEFAULT_USER_AGENT,
        },
        timeout: AWS_DOCUMENTATION_TIMEOUT,
      });

      // Convert HTML to markdown
      const markdown = htmlToMarkdown(response);

      // Apply pagination
      const endIndex = start_index + max_length;
      const paginatedContent = markdown.slice(start_index, endIndex);

      return paginatedContent;

    } catch (error: any) {
      const errorMessage = handleDocumentationError(error);
      throw new Error(`Failed to read documentation from ${url}: ${errorMessage}`);
    }
  },
});

// Search Documentation Tool
const searchDocumentationTool = createTool({
  id: 'search_documentation',
  description: 'Search AWS documentation using the official AWS Documentation Search API. Returns relevant pages with rankings.',
  inputSchema: SearchDocumentationInputSchema,
  outputSchema: SearchDocumentationOutputSchema,
  execute: async ({ context }) => {
    const { search_phrase, limit } = context;

    const requestBody = {
      textQuery: {
        input: search_phrase,
      },
      contextAttributes: [{ key: 'domain', value: 'docs.aws.amazon.com' }],
      acceptSuggestionBody: 'RawText',
      locales: ['en_us'],
    };

    try {
      const response = await ofetch(SEARCH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': DEFAULT_USER_AGENT,
        },
        body: requestBody,
        timeout: AWS_DOCUMENTATION_TIMEOUT,
      });

      const results: SearchResult[] = [];

      if (response.suggestions) {
        for (let i = 0; i < Math.min(response.suggestions.length, limit); i++) {
          const suggestion = response.suggestions[i];
          if (suggestion.textExcerptSuggestion) {
            const textSuggestion = suggestion.textExcerptSuggestion;
            let context: string | undefined;

            // Add context if available
            if (textSuggestion.summary) {
              context = textSuggestion.summary;
            } else if (textSuggestion.suggestionBody) {
              context = textSuggestion.suggestionBody;
            }

            results.push({
              rank_order: i + 1,
              url: textSuggestion.link || '',
              title: textSuggestion.title || '',
              context,
            });
          }
        }
      }

      return results;

    } catch (error: any) {
      const errorMessage = handleDocumentationError(error);
      throw new Error(`Failed to search AWS documentation for "${search_phrase}": ${errorMessage}`);
    }
  },
});

// Recommend Tool
const recommendTool = createTool({
  id: 'recommend',
  description: 'Get content recommendations for an AWS documentation page. Provides related pages in categories like Highly Rated, New, Similar, and Journey.',
  inputSchema: RecommendInputSchema,
  outputSchema: RecommendOutputSchema,
  execute: async ({ context }) => {
    const { url } = context;

    const recommendationUrl = `${RECOMMENDATIONS_API_URL}?path=${encodeURIComponent(url)}`;

    try {
      const response = await ofetch(recommendationUrl, {
        headers: {
          'User-Agent': DEFAULT_USER_AGENT,
        },
        timeout: AWS_DOCUMENTATION_TIMEOUT,
      });

      const results = parseRecommendationResults(response);
      return results;

    } catch (error: any) {
      const errorMessage = handleDocumentationError(error);
      throw new Error(`Failed to get recommendations for ${url}: ${errorMessage}`);
    }
  },
});

// Export all tools as an object for Mastra agent integration
export const documentationTools = {
  readDocumentation: readDocumentationTool,
  searchDocumentation: searchDocumentationTool,
  recommend: recommendTool,
};

// Export individual tools for selective use
export {
  readDocumentationTool,
  searchDocumentationTool,
  recommendTool,
};
