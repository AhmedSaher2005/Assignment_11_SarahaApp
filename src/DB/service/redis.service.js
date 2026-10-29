import { redisClient } from "../connectionRedis.js";

export const setValue = async ({ key, value, ttl } = {}) => {
  try {
    value = typeof value == "string" ? value : JSON.stringify(value);
    ttl
      ? await redisClient.set(key, value, { EX: ttl })
      : await redisClient.set(key, value);
  } catch (error) {
    console.log(error, "\nredis setValue failed");
  }
};
export const updateValue = async ({ key, value, ttl } = {}) => {
  try {
    if (!(await redisClient.exists(key))) return 0;
    await redisClient.set(key, value, { EX: ttl });
  } catch (error) {
    console.log(error, "\nredis updateValue failed");
  }
};
export const getValue = async (key) => {
  try {
    try {
      return JSON.parse(await redisClient.get(key));
    } catch (error) {
      return await redisClient.get(key);
    }
  } catch (error) {
    console.log(error, "\nredis getValue failed");
  }
};
export const ttl = async (key) => {
  try {
    return await redisClient.ttl(key);
  } catch (error) {
    console.log(error, "\nredis ttl failed");
  }
};
export const exists = async (key) => {
  try {
    return await redisClient.exists(key);
  } catch (error) {
    console.log(error, "\nredis exists failed");
  }
};
export const expire = async ({ key, ttl }) => {
  try {
    return await redisClient.expire(key, ttl);
  } catch (error) {
    console.log(error, "\nredis expire failed");
  }
};
export const deleteKey = async (key) => {
  try {
    if (!key?.length) return 0;
    return await redisClient.del(key);
  } catch (error) {
    console.log(error, "\nredis deleteKey failed");
  }
};
export const Keys = async (key) => {
  try {
    return await redisClient.keys(`${key}*`);
  } catch (error) {
    console.log(error, "\nredis allKeys failed");
  }
};
export const incr = async (key) => {
  try {
    return await redisClient.incr(key);
  } catch (error) {
    console.log(error, "\nredis increment failed");
  }
};
