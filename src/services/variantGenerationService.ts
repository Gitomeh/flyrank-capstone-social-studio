import { Platform } from '../types';
import { getPlatformProfile } from '../config/platformProfiles';

export interface GeneratedVariant {
  platform: Platform;
  content: string;
}

export function generateVariants(blogPost: { title: string; body: string }): GeneratedVariant[] {
  const variants: GeneratedVariant[] = [];

  // Generate Telegram variant
  variants.push({
    platform: 'telegram',
    content: generateTelegramContent(blogPost),
  });

  // Generate X variant
  variants.push({
    platform: 'x',
    content: generateXContent(blogPost),
  });

  // Generate LinkedIn variant
  variants.push({
    platform: 'linkedin',
    content: generateLinkedInContent(blogPost),
  });

  return variants;
}

function generateTelegramContent(blogPost: { title: string; body: string }): string {
  const { title, body } = blogPost;

  // Extract first paragraph for Telegram
  const firstParagraph = body.split('\n\n')[0] || body;
  const truncatedBody = firstParagraph.length > 500 ? firstParagraph.substring(0, 497) + '...' : firstParagraph;

  return `${title}\n\n${truncatedBody}\n\n#${title.split(' ')[0].toLowerCase()}`;
}

function generateXContent(blogPost: { title: string; body: string }): string {
  const { title, body } = blogPost;
  const profile = getPlatformProfile('x');

  // For X, create a concise summary
  const firstSentence = body.split('.')[0] || body;
  const truncatedSentence = firstSentence.length > 200 ? firstSentence.substring(0, 197) + '...' : firstSentence;

  const content = `${title}: ${truncatedSentence}`;
  const hashtag = `#${title.split(' ')[0].toLowerCase()}`;

  // Ensure it fits within X's limit
  const total = `${content} ${hashtag}`;
  if (total.length > profile.maxLength) {
    const trimmedContent = content.substring(0, profile.maxLength - hashtag.length - 3) + '...';
    return `${trimmedContent} ${hashtag}`;
  }

  return total;
}

function generateLinkedInContent(blogPost: { title: string; body: string }): string {
  const { title, body } = blogPost;
  const profile = getPlatformProfile('linkedin');

  // For LinkedIn, use a more professional format
  const intro = `📝 ${title}\n\n`;
  const truncatedBody = body.length > 1000 ? body.substring(0, 997) + '...' : body;
  const conclusion = '\n\nWhat are your thoughts? 👇';
  const hashtags = `\n\n#${title.split(' ')[0].toLowerCase()} #insights #professional`;

  const content = `${intro}${truncatedBody}${conclusion}${hashtags}`;

  // Ensure it fits within LinkedIn's limit
  if (content.length > profile.maxLength) {
    const trimmedBody = body.substring(0, profile.maxLength - intro.length - conclusion.length - hashtags.length - 3) + '...';
    return `${intro}${trimmedBody}${conclusion}${hashtags}`;
  }

  return content;
}
