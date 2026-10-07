import express, { Application } from 'express';
import { errorHandler } from './middleware/errorHandler';
import postRoutes from './routes/postRoutes';
import campaignRoutes from './routes/campaignRoutes';
import variantRoutes from './routes/variantRoutes';
import healthRoutes from './routes/healthRoutes';

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/api/health', healthRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/campaigns', campaignRoutes);
  app.use('/api/variants', variantRoutes);

  // Error handling
  app.use(errorHandler);

  return app;
}
