import { IncomingMessage } from "http";
import { PayPal } from "../vendors/paypal";
import { URLSearchParams } from "url";
import { actions, triggerEvent } from "../events";

export default {
  "/.webhook/paypal": async (
      _: URLSearchParams,
      data,
      req: IncomingMessage
  ) => {
    try {
      const event = await new PayPal().verifyNotification(req);
      actions[`${"paypal." + event.event_type}`](event)
          .then(res => res)
          .catch(err => {
              throw err;
          })
     // triggerEvent(("paypal." + event.event_type) as any, event);
      return { ack: "OK" };
    }
    catch(err) {
      return { ack: "OK" };
    }
  },
};

