import { config } from 'dotenv';

config();

export default {
    port: parseInt(process.env.PORT || '3000'),
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
    jwtSecret: process.env.JWT_SECRET || 'secret',
    jwtExpiration: process.env.JWT_EXPIRES_IN || '1h',
    redisUrl: process.env.REDIS_URL,
    databaseUrl: process.env.DATABASE_URL,
    frontendUrl: process.env.FRONTEND_URL,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
};