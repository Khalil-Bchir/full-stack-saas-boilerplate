// config.ts
import * as dotenv from 'dotenv';

// Load environment variables from .env into process.env
dotenv.config();

/**
 * Throws an error if the environment variable is missing.
 */
function requiredVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Same as `requiredVar`, but parses the variable as an integer.
 */
function requiredIntVar(name: string): number {
  const raw = requiredVar(name); // This will throw if missing
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid integer environment variable: ${name} = "${raw}"`);
  }
  return parsed;
}

export const config = {
  /**
   * Application Settings
   */
  //nodeEnv: requiredVar('NODE_ENV'),
  serverPort: requiredIntVar('SERVER_PORT'),
  serverHost: requiredVar('SERVER_HOST'),

  /**
   * Database
   */
  databaseUrl: requiredVar('DATABASE_URL'),

  /**
   * Auth
   */
  accessTokenSecret: requiredVar('ACCESS_TOKEN_SECRET'),
  accessTokenTtl: requiredVar('ACCESS_TOKEN_TTL'),
};
