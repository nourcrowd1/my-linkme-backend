import { actions, EventType } from ".";
import redis from "./redis";

/**
 * Pushes new event to queue
 * @param event
 * @param payload
 */

export default function triggerEvent<T = any>(event: EventType, payload: T) {
    // actions[event](payload)
    //     .then(res => res)
    //     .catch(err => {
    //         throw err;
    //     })
  redis
    .xadd(
      "events",
      "*",
      "event_type",
      event,
      ...Object.entries(payload).reduce((a, c) => {
        a.push(...c);
        return a;
      }, [])
    )
    .then(console.log)
    .catch(console.error);
}
