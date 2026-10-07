import { describe, it, expect, beforeEach } from 'vitest';
import { getPublisher } from '../src/adapters/publisherFactory';
import { TelegramPublisher } from '../src/adapters/TelegramPublisher';
import { MockXPublisher } from '../src/adapters/MockXPublisher';
import { MockLinkedInPublisher } from '../src/adapters/MockLinkedInPublisher';
import { config } from '../src/config';

describe('Adapter Substitution', () => {
  const originalPublishers = { ...config.publishers };

  beforeEach(() => {
    // Restore original config after each test
    config.publishers = { ...originalPublishers };
  });

  it('should return TelegramPublisher when configured', () => {
    config.publishers.telegram = 'telegram';
    const publisher = getPublisher('telegram');
    expect(publisher).toBeInstanceOf(TelegramPublisher);
  });

  it('should return MockXPublisher when configured', () => {
    config.publishers.x = 'mock_x';
    const publisher = getPublisher('x');
    expect(publisher).toBeInstanceOf(MockXPublisher);
  });

  it('should return MockLinkedInPublisher when configured', () => {
    config.publishers.linkedin = 'mock_linkedin';
    const publisher = getPublisher('linkedin');
    expect(publisher).toBeInstanceOf(MockLinkedInPublisher);
  });

  it('should allow switching publishers via configuration', () => {
    // Start with Telegram
    config.publishers.telegram = 'telegram';
    let publisher = getPublisher('telegram');
    expect(publisher).toBeInstanceOf(TelegramPublisher);

    // Switch to mock
    config.publishers.telegram = 'mock_x';
    publisher = getPublisher('telegram');
    expect(publisher).toBeInstanceOf(MockXPublisher);
  });

  it('should throw error for unknown publisher type', () => {
    config.publishers.telegram = 'unknown';
    expect(() => getPublisher('telegram')).toThrow('Unknown publisher type');
  });
});
