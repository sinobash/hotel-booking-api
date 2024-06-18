import { IORedisKey } from '@common/constants/redis.contant';
import { doHash } from '@common/utils/crypt.helper';
import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
    constructor(@Inject(IORedisKey) private readonly redisClient: Redis) {}

    async getKeys(pattern?: string): Promise<string[]> {
        return await this.redisClient.keys(pattern);
    }

    async insert(key: string, value: string | number, ttl?: number): Promise<string> {
        const result = await this.redisClient.set(key, value);
        if (ttl) {
            await this.redisClient.expireat(key, ttl);
        }
        return result;
    }

    async insertHashed(key: string, value: string, ttl?: number): Promise<string> {
        const hashedValue: string = await doHash(value);
        const result = await this.redisClient.set(key, hashedValue);
        if (ttl) {
            await this.redisClient.expireat(key, ttl);
        }
        return result;
    }

    async hashInsert(key: string, value: any, ttl?: number): Promise<number> {
        const result = await this.redisClient.hset(key, value);
        if (ttl) {
            await this.redisClient.expireat(key, ttl);
        }
        return result;
    }

    async get(key: string): Promise<string> {
        return this.redisClient.get(key);
    }

    async hashGet(key: string, field: string): Promise<string> {
        return this.redisClient.hget(key, field);
    }

    async hashGetAll(key: string): Promise<any> {
        return this.redisClient.hgetall(key);
    }

    async delete(key: string): Promise<number> {
        return await this.redisClient.del(key);
    }

    async hashDelete(key: string, value: any): Promise<number> {
        return await this.redisClient.hdel(key, value); /* await redis.hdel("user-hash", ["name", "description"]) */
    }

    async validate(key: string, value: string): Promise<boolean> {
        const storedValue = await this.redisClient.get(key);
        return storedValue === value;
    }

    async hashValidate(key: string, field: string, value: string): Promise<boolean> {
        const storedValue = await this.redisClient.hget(key, field);
        return storedValue === value;
    }

    async exists(key: string[]): Promise<number> {
        return this.redisClient.exists(...key); /* 0: false */
    }

    async hashExists(key: string, field: string): Promise<number> {
        return this.redisClient.hexists(key, field); /* 0: false, 1: true*/
    }
}
