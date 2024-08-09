import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import * as redis from "redis";

const client = redis.createClient();

(async () => {
  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();
})();

export const limiter = rateLimit({
  // Rate limiter configuration
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Limit each IP to 20 requests per `window` (here, per 10 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Redis store configuration
  store: new RedisStore({
    sendCommand: (...args: string[]) => client.sendCommand(args),
  }),
});
