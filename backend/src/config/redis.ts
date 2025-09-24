import Redis from 'ioredis';
import config from './environment';

const redisURL: string = config.redisUrl || 'redis://redis:6379';
const {hostname, port} = new URL(redisURL);

const redis = new Redis(
    {
        host: hostname,
        port: parseInt(port),
    }
);

export default redis;
