import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from '../db/types.js';
import { env } from './env.js';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
  log: env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

export { pool };
