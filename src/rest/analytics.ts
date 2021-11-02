import { IncomingMessage } from "http";
import {Connection} from "typeorm";
import { URLSearchParams } from "url";
import {Analytics} from "../entities/Analytics";

export default {
  "/analytics": async (
    params: URLSearchParams, // { event, url, title, acct }
    { connection }: { connection: Connection },
    __: IncomingMessage
  ) => {
      const analytics = new Analytics();
      for (let  [name, value] of params) {
          analytics[name] = (name === 'user_id')  ? +value : value;
      }

      await analytics.save();
      return { ok: 1 };
  }
};

