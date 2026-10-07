import { Platform, SocialPublisher } from '../types';
import { TelegramPublisher } from './TelegramPublisher';
import { MockXPublisher } from './MockXPublisher';
import { MockLinkedInPublisher } from './MockLinkedInPublisher';
import { config } from '../config';

export function getPublisher(platform: Platform): SocialPublisher {
  const publisherType = config.publishers[platform];

  switch (publisherType) {
    case 'telegram':
      return new TelegramPublisher();
    case 'mock_x':
      // Use mock X publisher for any platform configured as mock_x
      return new MockXPublisher();
    case 'mock_linkedin':
      return new MockLinkedInPublisher();
    default:
      throw new Error(`Unknown publisher type: ${publisherType} for platform: ${platform}`);
  }
}
