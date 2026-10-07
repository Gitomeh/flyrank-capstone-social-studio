import { SocialPublisher, PublishInput, PublishResult } from '../types';

export abstract class BaseSocialPublisher implements SocialPublisher {
  abstract publish(input: PublishInput): Promise<PublishResult>;

  protected logPublish(input: PublishInput): void {
    console.log(`[${this.constructor.name}] Publishing to ${input.platform}`, {
      contentLength: input.content.length,
      idempotencyKey: input.idempotencyKey,
    });
  }
}
