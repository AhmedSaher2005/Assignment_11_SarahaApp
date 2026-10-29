import { createClient } from "redis";
import { REDIS_URL } from "../../config/config.service.js";

export const redisClient = createClient({
  url: REDIS_URL,
});


export default async function connectionRedis() {
  try {
    await redisClient.connect()
    console.log("redis connected successfully...😍");
  } catch (error) {
    console.log(error, "redis connected faild...😢");
  }
}
