import { IncomingMessage } from "http";
import { Connection } from "typeorm";
import { URLSearchParams } from "url";

export default {
  "/.well-known/health-check": (
    _: URLSearchParams,
    { connection }: { connection: Connection },
    __: IncomingMessage
  ) => {
    return { status: connection.isConnected ? "OK" : "NOT OK" };
  },
};
