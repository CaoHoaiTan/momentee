import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import depthLimit from 'graphql-depth-limit';
import { typeDefs, resolvers } from './graphql/schema.js';
import { createContext, type GQLContext } from './graphql/context.js';
import healthRouter from './routes/health.route.js';
import webhookRouter from './routes/webhook.route.js';
import uploadRouter from './routes/upload.route.js';
import musicRouter from './routes/music.route.js';
import { env } from './config/env.js';

async function main() {
  const app = express();

  // Trust first proxy (Render's load balancer) for correct req.ip and rate limiting
  app.set('trust proxy', 1);

  // Global middleware — relax CSP in dev for Apollo Sandbox
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'development' ? false : undefined,
      crossOriginEmbedderPolicy: env.NODE_ENV === 'development' ? false : undefined,
    }),
  );
  app.use(compression());
  app.use(morgan('dev'));
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  // Rate limiting for GraphQL endpoint
  const graphqlLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: env.NODE_ENV === 'production' ? 100 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
  });

  // Routes
  
  app.use(healthRouter);
  app.use(webhookRouter);
  app.use(uploadRouter);
  app.use(musicRouter);

  // Apollo Server
  const server = new ApolloServer<GQLContext>({
    typeDefs,
    resolvers,
    introspection: env.NODE_ENV === 'development',
    validationRules: [depthLimit(7)],
  });

  await server.start();

  app.use(
    '/graphql',
    graphqlLimiter,
    express.json({ limit: '2mb' }),
    expressMiddleware(server, {
      context: async ({ req }) => createContext({ req: req as any }),
    }) as any,
  );

  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${env.PORT}/graphql (${env.NODE_ENV})`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
