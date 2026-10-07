import { Platform, PlatformProfile } from '../types';

export const PLATFORM_PROFILES: Record<Platform, PlatformProfile> = {
  telegram: {
    platform: 'telegram',
    maxLength: 4096,
    maxHashtags: 5,
    tone: 'clear and readable',
  },
  x: {
    platform: 'x',
    maxLength: 280,
    maxHashtags: 3,
    tone: 'concise and punchy',
  },
  linkedin: {
    platform: 'linkedin',
    maxLength: 3000,
    maxHashtags: 10,
    tone: 'professional and informative',
  },
};

export function getPlatformProfile(platform: Platform): PlatformProfile {
  const profile = PLATFORM_PROFILES[platform];
  if (!profile) {
    throw new Error(`Unknown platform: ${platform}`);
  }
  return profile;
}
