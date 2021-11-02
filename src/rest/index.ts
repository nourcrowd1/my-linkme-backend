import { ServerResponse } from "http";
import {IncomingMessageLinkTree} from "../classes";
import { URL } from "url";
import {InputError, NotAuthorizedError} from "../errors";
import analytics from "./analytics";
import health from "./health";
import paypalWebhook from "./paypal-webhook";
import { addUserToReq } from "../lib";

const routes = Object.assign({}, health, paypalWebhook, analytics);

export default function makeRESTMiddleware(context: any) {
  return async (
    req: IncomingMessageLinkTree,
    res: ServerResponse,
    next?: () => any
  ) => {
    const url = new URL(req.url, "http://0.0.0.0");
    await addUserToReq(req);
    if (!(url.pathname in routes)) return next ? next() : res.end("Not Found");
    const sendJSON = (json: Record<string, any>, code: number = 200) => {
      res.statusCode = code;
      const text = JSON.stringify(json);
      res.setHeader("content-type", "application/json");
      res.setHeader("content-length", text.length);
      res.setHeader(
          "Access-Control-Allow-Headers",
          "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
      return res.end(text);
    };
    try {
      const resolver = routes[url.pathname];
      const params = url.searchParams;
      const result = await resolver(params, context, req);
      return sendJSON(result);
    } catch (error) {
      if (error instanceof InputError) {
        return sendJSON({ field: error.field, message: error.message }, 400);
      }
      console.error(error);
      return sendJSON(
        { name: error.name, message: "InternalServerError" },
        500
      );
    }
  };
}
