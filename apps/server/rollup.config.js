import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: 'src',
  },
  external: [
    /node_modules/,
    'express',
    'cors',
    'helmet',
    'compression',
    'morgan',
    'express-rate-limit',
    '@apollo/server',
    '@apollo/server/express4',
    'graphql',
    'graphql-tag',
    'graphql-subscriptions',
    'graphql-ws',
    'ws',
    'kysely',
    'pg',
    'bcryptjs',
    'jsonwebtoken',
    'zod',
    'dotenv',
    '@paralleldrive/cuid2',
    '@momentee/shared',
    'fs',
    'path',
    'node:fs',
    'node:path',
  ],
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      outDir: 'dist',
    }),
  ],
};
