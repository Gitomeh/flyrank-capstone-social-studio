import { BaseSocialPublisher } from './SocialPublisher';
import { PublishInput, PublishResult } from '../types';
import { config } from '../config';

export class TelegramPublisher extends BaseSocialPublisher {
  async publish(input: PublishInput): Promise<PublishResult> {
    this.logPublish(input);

    const token = config.telegramBotToken;
    const chatId = config.telegramChatId;

    if (!token || !chatId) {
      return {
        success: false,
        error: 'Telegram credentials not configured',
      };
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: input.content,
        }),
      });

      const data = await response.json() as any;

      if (!response.ok || !data.ok) {
        return {
          success: false,
          error: data.description || 'Telegram API error',
        };
      }

      return {
        success: true,
        externalPostId: data.result.message_id.toString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
