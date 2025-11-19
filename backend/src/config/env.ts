import dotenv from 'dotenv';

if (!process.env.DOTENV_CONFIG_SILENT) {
  process.env.DOTENV_CONFIG_SILENT = 'true';
}

dotenv.config({ override: false });

const defaults = {
  mongoUri: 'mongodb://127.0.0.1:27017/jats',
  jwtSecret: 'replace-me',
  port: 4000
} as const;

export const env = {
  get nodeEnv(): string {
    return process.env.NODE_ENV ?? 'development';
  },
  get port(): number {
    return Number(process.env.PORT ?? defaults.port);
  },
  get mongoUri(): string {
    return process.env.MONGO_URI ?? defaults.mongoUri;
  },
  get jwtSecret(): string {
    return process.env.JWT_SECRET ?? defaults.jwtSecret;
  }
};

export const isTest = (): boolean => env.nodeEnv === 'test';
