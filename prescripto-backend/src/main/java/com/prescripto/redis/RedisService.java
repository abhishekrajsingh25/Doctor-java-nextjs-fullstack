package com.prescripto.redis;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
public class RedisService {

    private final StringRedisTemplate redis;

    public RedisService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public String get(String key) {
        return redis.opsForValue().get(key);
    }

    public void set(String key, String value, long seconds) {
        redis.opsForValue().set(key, value, seconds, TimeUnit.SECONDS);
    }

    public void delete(String key) {
        redis.delete(key);
    }

    // SET NX EX
    public boolean acquireLock(String key, long seconds) {
        try {
            Boolean success = redis.opsForValue()
                    .setIfAbsent(key, "locked", seconds, TimeUnit.SECONDS);
            return Boolean.TRUE.equals(success);
        } catch (Exception e) {
            return false; // fail open (DB still protects uniqueness)
        }
    }

    public void releaseLock(String key) {
        try {
            redis.delete(key);
        } catch (Exception ignored) {}
    }
}
