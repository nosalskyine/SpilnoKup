"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
exports.isRedisConnected = isRedisConnected;
exports.setJSON = setJSON;
exports.getJSON = getJSON;
exports.deleteKey = deleteKey;
exports.exists = exists;
exports.setWithExpiry = setWithExpiry;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("./logger");
let redis = null;
exports.redis = redis;
let connected = false;
try {
    exports.redis = redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        retryStrategy(times) {
            if (times > 3) {
                logger_1.logger.warn('Redis unavailable — working without cache');
                return null; // stop retrying
            }
            return Math.min(times * 200, 2000);
        },
    });
    redis.on('connect', () => { connected = true; logger_1.logger.info('Redis connected'); });
    redis.on('error', () => { connected = false; });
    redis.on('close', () => { connected = false; });
    redis.connect().catch(() => {
        logger_1.logger.warn('Redis not available — running without cache');
    });
}
catch {
    logger_1.logger.warn('Redis init failed — running without cache');
}
function isRedisConnected() {
    return connected;
}
async function setJSON(key, value, ttlSeconds) {
    if (!redis || !connected)
        return;
    const json = JSON.stringify(value);
    if (ttlSeconds) {
        await redis.set(key, json, 'EX', ttlSeconds);
    }
    else {
        await redis.set(key, json);
    }
}
async function getJSON(key) {
    if (!redis || !connected)
        return null;
    const data = await redis.get(key);
    if (!data)
        return null;
    return JSON.parse(data);
}
async function deleteKey(key) {
    if (!redis || !connected)
        return 0;
    return redis.del(key);
}
async function exists(key) {
    if (!redis || !connected)
        return false;
    return (await redis.exists(key)) === 1;
}
async function setWithExpiry(key, value, seconds) {
    if (!redis || !connected)
        return;
    await redis.set(key, value, 'EX', seconds);
}
//# sourceMappingURL=redis.js.map