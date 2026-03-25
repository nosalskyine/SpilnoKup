import Redis from 'ioredis';
declare let redis: Redis | null;
export declare function isRedisConnected(): boolean;
export declare function setJSON(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
export declare function getJSON<T = unknown>(key: string): Promise<T | null>;
export declare function deleteKey(key: string): Promise<number>;
export declare function exists(key: string): Promise<boolean>;
export declare function setWithExpiry(key: string, value: string, seconds: number): Promise<void>;
export { redis };
//# sourceMappingURL=redis.d.ts.map