import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  encryptionKey: process.env.ENCRYPTION_KEY || '',
  publishers: {
    telegram: process.env.PUBLISHER_TELEGRAM || 'telegram',
    x: process.env.PUBLISHER_X || 'mock_x',
    linkedin: process.env.PUBLISHER_LINKEDIN || 'mock_linkedin',
  },
};

export function isDevelopment(): boolean {
  return config.nodeEnv === 'development';
}

export function isProduction(): boolean {
  return config.nodeEnv === 'production';
}
