import { Redis } from "ioredis";
import { v4 } from "uuid";
import { actions } from ".";
import redis from "./redis";

export class EventProcessor {
  private timer: NodeJS.Timer;
  constructor(private redis: Redis) {}

  readonly id = v4();

  async start() {
    console.log("Starting processor");
    await this.redis
      .xgroup("CREATE", "events", "workers", "$", "MKSTREAM")
      .catch(() => {});
    this.getNextBatch();
  }

  private getNextBatch = () => {
    this.redis
      .xreadgroup(
        "GROUP",
        "workers",
        "worker",
        "BLOCK",
        0,
        "COUNT",
        100,
        "STREAMS",
        "events",
        ">"
      )
      .then(async (result) => {
        if (result) {
          await this.process(result[0][1]);
        }
        this.getNextBatch();
      })
      .catch((error) => {
        console.error(error);
        this.scheduleNext();
      });
  };

  private scheduleNext = () => {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(this.getNextBatch, 1000);
  };

  process = async (events: string[]) => {
    if (!events?.length) {
      return;
    }
    for (let [_, payload] of events) {
      const event: Record<string, any> = {};
      for (let i = 0; i < payload.length; i += 2) {
        event[payload[i]] = payload[i + 1];
      }
      if (event.event_type && event.event_type in actions) {
        await actions[event.event_type](event);
      }
    }
  };

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

const processor = new EventProcessor(redis);
process.on("exit", () => processor.stop());
export default processor;
