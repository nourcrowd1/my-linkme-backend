import { ServerResponse } from "http";
import makeGraphQLMiddleware from "../graphql";
import makeRESTMiddleware from "../rest";
import makeAMPRenderer, {sendHTML} from "../amp";
import eventProcessor from "../events/processor";
import {IncomingMessageLinkTree} from "../classes";


eventProcessor.start();

export default async function handleRequest(context) {
  const REST = makeRESTMiddleware(context);
  const GraphQL = makeGraphQLMiddleware(context, { endpoint: "/.api/graphql" });
  const AMPRenderer = await makeAMPRenderer(context);
  return async (req: IncomingMessageLinkTree, res: ServerResponse) => {
    req.on("close", () => res.end());
    if (req.url.startsWith("/.api/graphql")) {
      // GraphQL Query or Playground
      return GraphQL(req, res);
    }
    // Other REST requests
    return REST(req, res, () => AMPRenderer(req, res));
  };
}
