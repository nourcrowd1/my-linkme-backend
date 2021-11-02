import Redis from "ioredis";
import { redisURL } from "../config";
export default new Redis(redisURL);
