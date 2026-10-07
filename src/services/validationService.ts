import { Platform } from '../types';
import { getPlatformProfile } from '../config/platformProfiles';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePlatformConstraints(
  content: string,
  platform: Platform
): ValidationResult {
  const profile = getPlatformProfile(platform);
  const errors: string[] = [];

  // Check character length
  if (content.length > profile.maxLength) {
    errors.push(
      `Content exceeds ${platform} maximum length of ${profile.maxLength} characters (current: ${content.length})`
    );
  }

  // Check if content is empty
  if (content.trim().length === 0) {
    errors.push('Content cannot be empty');
  }

  // Count hashtags
  const hashtagCount = (content.match(/#/g) || []).length;
  if (hashtagCount > profile.maxHashtags) {
    errors.push(
      `Content exceeds ${platform} maximum hashtag count of ${profile.maxHashtags} (current: ${hashtagCount})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
